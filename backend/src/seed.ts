import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create ADMIN User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gojovoid.me',
      name: 'Gojo Satoru',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'http://localhost:5000/images/gojo_hero.jpg',
      bio: 'The strongest sorcerer. Administrator of the Forbidden Archives.',
      signature: 'Throughout Heaven and Earth, I alone am the honored one.',
      reputation: 9999
    }
  });

  // 2. Create Regular Users
  const userPassword = await bcrypt.hash('user123', 10);
  const itadori = await prisma.user.create({
    data: {
      email: 'yuji@jujutsu.edu',
      name: 'Yuji Itadori',
      password: userPassword,
      role: 'MEMBER',
      bio: 'Just a guy trying to help people.',
      reputation: 150
    }
  });

  const megumi = await prisma.user.create({
    data: {
      email: 'megumi@jujutsu.edu',
      name: 'Megumi Fushiguro',
      password: userPassword,
      role: 'MOD',
      bio: 'Shadow technique practitioner.',
      reputation: 500
    }
  });

  // 3. Create Categories and Forums
  const generalCat = await prisma.category.create({
    data: {
      name: 'GENERAL INFORMATION',
      description: 'Official updates and community guidelines.',
      order: 1,
      forums: {
        create: [
          { name: 'Announcements', description: 'Nghe ý kiến ​​từ cấp trên (Chỉ dành cho quản trị viên).', order: 1, icon: 'Megaphone' },
          { name: 'Rules & FAQ', description: "Don't break the binding vows.", order: 2, icon: 'Scroll' }
        ]
      }
    },
    include: { forums: true }
  });

  const discussionCat = await prisma.category.create({
    data: {
      name: 'THẢO LUẬN',
      description: 'Hãy thảo luận về chủ đề các bạn cần hỏi',
      order: 5,
      forums: {
        create: [
          { name: 'lọ vương chí tôn', description: 'lọ vương chí tôn', order: 1, icon: 'Trophy' },
          { name: 'Topic cuộc sống của bạn', description: '*', order: 2, icon: 'Heart' },
          { name: 'Công nghệ', description: '*', order: 3, icon: 'Cpu' },
          { name: 'Tin tức thế giới', description: 'Discuss whats going on in the real world here.', order: 4, icon: 'Globe' },
          { name: 'Tutorial', description: 'Tutorials on Hacking , programming and other should be posted here.', order: 5, icon: 'BookOpen' },
          { name: 'Game', description: 'All about games', order: 6, icon: 'Gamepad2' },
          { name: 'Source code', description: 'Source code', order: 7, icon: 'Code' },
          { name: 'Services', description: 'Services', order: 8, icon: 'Briefcase' },
          { name: 'Scam Reports', description: 'Report users of this forum for scamming.', order: 9, icon: 'AlertTriangle' },
        ]
      }
    },
    include: { forums: true }
  });

  // 4. Create Real Threads and Posts
  const forumAnnounce = generalCat.forums[0];
  const forumTechnique = discussionCat.forums[0];

  // Thread 1: Official Announcement
  await prisma.thread.create({
    data: {
      title: 'Welcome to GojoVoid Forums - The Forbidden Archives',
      content: 'This forum is dedicated to preserving knowledge about Minecraft. All members must adhere to the rules.',
      authorId: admin.id,
      forumId: forumAnnounce.id,
      views: 1250,
      posts: {
        create: [
          { content: 'Happy to be here! Looking forward to learning.', authorId: itadori.id },
          { content: 'Rules are clear. I will monitor the shadow discussions.', authorId: megumi.id }
        ]
      }
    }
  });

  // Thread 2: A real "Discussion"
  const t2 = await prisma.thread.create({
    data: {
      title: 'How to build server Minecraft?',
      content: 'lọ lọ lọ',
      authorId: itadori.id,
      forumId: forumTechnique.id,
      views: 450,
      //posts: {
        //create: [
          //{ content: 'It starts with atomic-level manipulation of cursed energy. You need the Six Eyes for that, kid.', authorId: admin.id },
          //{ content: 'Try focusing on the space between molecules rather than just an overall barrier.', authorId: megumi.id }
        //]
      //}
    }
  });

  // 5. Add some "Real" likes
  const firstPost = await prisma.post.findFirst({
    where: { threadId: t2.id }
  });

  if (firstPost) {
    await prisma.like.create({
      data: { userId: admin.id, postId: firstPost.id }
    });
    await prisma.like.create({
      data: { userId: megumi.id, postId: firstPost.id }
    });
  }

  // 6. System Configuration
  await prisma.systemConfig.upsert({
    where: { key: 'maintenance' },
    update: {},
    create: { key: 'maintenance', value: 'false' }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'GojoVoid' }
  });
  
  await prisma.systemConfig.upsert({
    where: { key: 'reg_open' },
    update: {},
    create: { key: 'reg_open', value: 'true' }
  });

  console.log('--- DATABASE SEEDED WITH REAL DATA ---');
  console.log('ADMIN ACCOUNT: admin@gojovoid.me / admin123');
  console.log('MEMBER ACCOUNT: yuji@jujutsu.edu / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
