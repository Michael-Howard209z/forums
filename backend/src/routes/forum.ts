import { Router } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Rate limiter for messaging endpoints — key by authenticated user when available
const messagesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // allow up to 60 messages-related requests per minute per user/ip
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    // If authentication middleware ran before this limiter, prefer user id
    const maybeUser = (req as any).user;
    return maybeUser?.id || req.ip;
  },
  message: { message: 'Too many messaging requests, slow down.' }
});

const createAuditLog = async (adminId: string, action: string, target?: string, details?: string) => {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, target, details }
    });
  } catch (e) {
    console.error("Failed to create audit log", e);
  }
};

// --- CONFIG ---
import fs from 'fs';
import path from 'path';

// --- AVATAR SYSTEM ---

// Get list of available avatars
router.get('/avatars/list', async (req, res) => {
  const avatarDir = path.join(__dirname, '../../public/avatar');
  try {
    const files = fs.readdirSync(avatarDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    // Return paths relative to public, e.g., "/avatar/filename.jpg"
    const avatarPaths = files.map(file => `/avatar/${file}`);
    res.json(avatarPaths);
  } catch (error: any) {
    res.status(500).json({ message: 'Error listing avatars', error: error.message });
  }
});

// Update user avatar
router.put('/user/avatar', authenticate, async (req: AuthRequest, res) => {
  try {
    const { avatarPath } = req.body;
    
    // Security check: ensure the avatar exists in our public/avatar folder
    const filename = path.basename(avatarPath);
    const avatarDir = path.join(__dirname, '../../public/avatar');
    if (!fs.existsSync(path.join(avatarDir, filename))) {
        return res.status(400).json({ message: 'Invalid avatar selection' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarPath },
      select: { id: true, name: true, avatar: true }
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating avatar', error: error.message });
  }
});

// Heartbeat - Keep user marked as online
router.post('/heartbeat', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastSeen: new Date() }
    });
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating heartbeat', error: error.message });
  }
});

router.get('/config', async (req, res) => {
  try {
    const configItems = await prisma.systemConfig.findMany();
    // Convert array of {key, value} to object
    const config = configItems.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    
    // Default values if not present
    if (!config.maintenance) config.maintenance = 'false';
    if (!config.site_name) config.site_name = 'GojoVoid';
    
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching config', error: error.message });
  }
});

// --- CATEGORIES & FORUMS ---

// Get all categories with forums (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      include: {
        forums: {
          include: {
            _count: {
              select: { threads: true }
            },
            threads: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
              include: {
                author: {
                  select: { id: true, name: true }
                },
                posts: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  include: {
                    author: {
                      select: { id: true, name: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Enhance categories with real post counts and last post info
    const enhancedCategories = await Promise.all(categories.map(async (cat) => {
      const enhancedForums = await Promise.all(cat.forums.map(async (forum) => {
        // Count all posts (replies) in this forum
        const replyCount = await prisma.post.count({
          where: { thread: { forumId: forum.id } }
        });
        
        // Total posts = number of threads (OPs) + number of replies
        const totalPosts = forum._count.threads + replyCount;
        
        // Determine last post info
        let lastPost = null;
        if (forum.threads.length > 0) {
          const latestThread = forum.threads[0];
          const latestReply = latestThread.posts.length > 0 ? latestThread.posts[0] : null;
          
          if (latestReply && latestReply.createdAt > latestThread.createdAt) {
             lastPost = {
               threadId: latestThread.id,
               title: latestThread.title,
               authorName: latestReply.author.name,
               authorId: latestReply.author.id,
               date: latestReply.createdAt
             };
          } else {
             lastPost = {
               threadId: latestThread.id,
               title: latestThread.title,
               authorName: latestThread.author.name,
               authorId: latestThread.author.id,
               date: latestThread.createdAt
             };
          }
        }

        return {
          ...forum,
          postCount: totalPosts,
          lastPost
        };
      }));

      return {
        ...cat,
        forums: enhancedForums
      };
    }));

    res.json(enhancedCategories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get a specific forum and its threads (Public)
router.get('/forums/:id', async (req, res) => {
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: req.params.id },
      include: {
        threads: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
            _count: { select: { posts: true } }
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
        }
      }
    });
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    res.json(forum);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching forum', error: error.message });
  }
});

// --- THREADS & POSTS ---

// Get latest threads across all forums
router.get('/threads/latest', async (req, res) => {
  try {
    const threads = await prisma.thread.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } }
      }
    });
    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching latest threads', error: error.message });
  }
});

// Get a specific thread and its posts (Public)
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true, signature: true, createdAt: true } },
        posts: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true, signature: true, createdAt: true } },
            likes: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    
    // Increment views
    await prisma.thread.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    });

    res.json(thread);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching thread', error: error.message });
  }
});

// Create a new thread (Protected)
router.post('/threads', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, forumId, tags } = req.body;
    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        forumId,
        authorId: req.user.id,
        tags
      }
    });
    res.status(201).json(thread);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating thread', error: error.message });
  }
});

// Create a new post (Protected)
router.post('/posts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, threadId } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        threadId,
        authorId: req.user.id,
      }
    });
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// --- LIKES ---

router.post('/posts/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id as string;

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.json({ liked: false });
    }

    await prisma.like.create({
      data: { userId, postId }
    });
    res.json({ liked: true });
  } catch (error: any) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

// --- PROFILES ---

router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        signature: true,
        role: true,
        reputation: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: {
            threads: true,
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// --- STATS ---

router.get('/stats', async (req, res) => {
  try {
    const totalThreads = await prisma.thread.count();
    const totalPosts = await prisma.post.count();
    const totalUsers = await prisma.user.count();
    const newestUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { name: true }
    });

    res.json({
      totalThreads,
      totalPosts,
      totalUsers,
      newestUser: newestUser?.name || 'None'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get online members (lastSeen within 5 minutes)
router.get('/online-members', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineMembers = await prisma.user.findMany({
      where: {
        lastSeen: {
          gte: fiveMinutesAgo
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true
      },
      orderBy: { lastSeen: 'desc' }
    });

    res.json({
      onlineCount: onlineMembers.length,
      members: onlineMembers
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching online members', error: error.message });
  }
});

// --- ADMIN ONLY ---
router.get('/admin/logs', authenticate, authorize(['ADMIN']), async (req, res) => {
  res.json({ message: 'Audit logs access granted' });
});

// Admin: Get all threads
router.get('/admin/threads', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const threads = await prisma.thread.findMany({
      include: {
        author: { select: { name: true } },
        forum: { select: { name: true } },
        _count: { select: { posts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching threads', error: error.message });
  }
});

// Admin: Delete thread
router.delete('/admin/threads/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const threadId = req.params.id as string;
    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    
    // Delete all posts first due to FK constraints if not cascade
    await prisma.post.deleteMany({ where: { threadId } });
    await prisma.thread.delete({ where: { id: threadId } });
    
    await createAuditLog(req.user!.id, 'DELETE_THREAD', thread?.title, `Deleted thread ID: ${threadId}`);
    
    res.json({ message: 'Thread deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting thread', error: error.message });
  }
});

// Admin: Patch thread (pin/lock)
router.patch('/admin/threads/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { isPinned, isLocked } = req.body;
    const threadId = req.params.id as string;
    const thread = await prisma.thread.update({
      where: { id: threadId },
      data: { isPinned, isLocked }
    });
    
    await createAuditLog(req.user!.id, 'UPDATE_THREAD', thread.title, `Pinned: ${isPinned}, Locked: ${isLocked}`);
    
    res.json(thread);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating thread', error: error.message });
  }
});

// Admin: Get all users
router.get('/admin/users', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { threads: true, posts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Admin: Update user role
router.patch('/admin/users/:id/role', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id as string;
    
    // Prevent self-demotion
    if (userId === req.user!.id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'You cannot demote yourself from Admin' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    
    await createAuditLog(req.user!.id, 'UPDATE_USER_ROLE', updated.name, `New role: ${role}`);
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Admin: Delete user
router.delete('/admin/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id as string;
    if (userId === req.user!.id) {
       return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    
    // Cascade delete in code if not in DB
    await prisma.post.deleteMany({ where: { authorId: userId } });
    await prisma.thread.deleteMany({ where: { authorId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    
    await createAuditLog(req.user!.id, 'DELETE_USER', targetUser?.name, `Deleted user: ${targetUser?.email}`);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// --- CATEGORY & FORUM MGMT ---

// Admin: Get all categories + forums (including hidden)
router.get('/admin/all-categories', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { forums: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching management categories', error: error.message });
  }
});

// Admin: Create category
router.post('/admin/categories', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, order, isVisible } = req.body;
    const cat = await prisma.category.create({
      data: { name, description, order: parseInt(order) || 0, isVisible: isVisible !== undefined ? isVisible : true }
    });
    await createAuditLog(req.user!.id, 'CREATE_CATEGORY', name);
    res.status(201).json(cat);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// Admin: Update category
router.patch('/admin/categories/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, order, isVisible } = req.body;
    const catId = req.params.id as string;
    const cat = await prisma.category.update({
      where: { id: catId },
      data: { name, description, order: order !== undefined ? parseInt(order) : undefined, isVisible }
    });
    await createAuditLog(req.user!.id, 'UPDATE_CATEGORY', name);
    res.json(cat);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// Admin: Delete category
router.delete('/admin/categories/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const catId = req.params.id as string;
    const cat = await prisma.category.findUnique({ where: { id: catId } });
    // This is dangerous, usually you'd want to move forums first.
    await prisma.forum.deleteMany({ where: { categoryId: catId } });
    await prisma.category.delete({ where: { id: catId } });
    await createAuditLog(req.user!.id, 'DELETE_CATEGORY', cat?.name);
    res.json({ message: 'Category and its forums deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// Admin: Create forum
router.post('/admin/forums', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, categoryId, order } = req.body;
    const forum = await prisma.forum.create({
      data: { name, description, categoryId, order: parseInt(order) || 0 }
    });
    await createAuditLog(req.user!.id, 'CREATE_FORUM', name, `Category ID: ${categoryId}`);
    res.status(201).json(forum);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating forum', error: error.message });
  }
});

// Admin: Update forum
router.patch('/admin/forums/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, categoryId, order } = req.body;
    const forumId = req.params.id as string;
    const forum = await prisma.forum.update({
      where: { id: forumId },
      data: { name, description, categoryId, order: order !== undefined ? parseInt(order) : undefined }
    });
    await createAuditLog(req.user!.id, 'UPDATE_FORUM', name);
    res.json(forum);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating forum', error: error.message });
  }
});

// Admin: Delete forum
router.delete('/admin/forums/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const forumId = req.params.id as string;
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    await prisma.forum.delete({ where: { id: forumId } });
    await createAuditLog(req.user!.id, 'DELETE_FORUM', forum?.name);
    res.json({ message: 'Forum deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting forum', error: error.message });
  }
});

// Admin: Get audit logs
router.get('/admin/audit-logs', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// Admin: Get Settings
router.get('/admin/settings', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const settings = await prisma.systemConfig.findMany();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Admin: Update Setting
router.post('/admin/settings', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { key, value } = req.body;
    const setting = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    await createAuditLog(req.user!.id, 'UPDATE_SETTING', key, `Value: ${value}`);
    
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
});


// --- FOLLOW SYSTEM ---

router.post('/follow/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id as string;

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } }
      });
      return res.json({ followed: false });
    }

    await prisma.follow.create({
      data: { followerId, followingId }
    });
    res.json({ followed: true });
  } catch (error: any) {
    res.status(500).json({ message: 'Error toggling follow', error: error.message });
  }
});

router.get('/users/:id/is-following', authenticate, async (req: AuthRequest, res) => {
  try {
    const follow = await prisma.follow.findUnique({
      where: { 
        followerId_followingId: { 
          followerId: req.user.id, 
          followingId: req.params.id as string 
        } 
      }
    });
    res.json({ following: !!follow });
  } catch (error: any) {
    res.status(500).json({ message: 'Error checking follow status', error: error.message });
  }
});

// --- PRIVATE MESSAGES ---

// Get all conversations for current user
router.get('/messages/conversations', authenticate, messagesLimiter, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    // This is a simplified way to get unique conversation partners
    const sentTo = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiver: { select: { id: true, name: true, avatar: true } } },
      distinct: ['receiverId']
    });
    const receivedFrom = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { sender: { select: { id: true, name: true, avatar: true } } },
      distinct: ['senderId']
    });

    // Merge and unique
    const partnersMap = new Map();
    sentTo.forEach(m => partnersMap.set(m.receiver.id, m.receiver));
    receivedFrom.forEach(m => partnersMap.set(m.sender.id, m.sender));
    
    res.json(Array.from(partnersMap.values()));
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get chat history with a specific user
// Supports incremental fetch via ?since=<ISO timestamp>. If not provided, returns last 100 messages.
router.get('/messages/:userId', authenticate, messagesLimiter, async (req: AuthRequest, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId as string;
    const since = req.query.since as string | undefined;

    let messages;
    if (since) {
      const sinceDate = new Date(since);
      // Fetch only messages after 'since'
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: myId, receiverId: otherId, createdAt: { gt: sinceDate } },
            { senderId: otherId, receiverId: myId, createdAt: { gt: sinceDate } }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, avatar: true } } }
      });
    } else {
      // Initial load: return last 100 messages to avoid fetching entire history
      const recent = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: myId, receiverId: otherId },
            { senderId: otherId, receiverId: myId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { sender: { select: { id: true, name: true, avatar: true } } }
      });
      // reverse to chronological order
      messages = recent.reverse();
    }

    // Mark as read for messages received from other user up to now
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message
router.post('/messages', authenticate, messagesLimiter, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

export default router;
