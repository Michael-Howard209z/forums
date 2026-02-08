import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Helper function to get random avatar
function getRandomAvatar(): string {
  const avatarDir = path.join(__dirname, '../../public/avatar');
  try {
    const files = fs.readdirSync(avatarDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    if (files.length === 0) return '/avatar/gojo.jpg'; // fallback
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `/avatar/${randomFile}`;
  } catch (error) {
    console.error('Error reading avatar directory:', error);
    return '/avatar/gojo.jpg'; // fallback
  }
}

// Chống thư rác: Tối đa 3 lượt đăng ký mỗi giờ cho mỗi địa chỉ IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  message: { message: 'Too many accounts created from this IP. Please try again in an hour.' }
});

// Anti-BruteForce: Max 5 login attempts per 15 mins
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' }
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomAvatar = getRandomAvatar();
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar: randomAvatar,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

export default router;
