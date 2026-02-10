import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth';
import forumRoutes from './routes/forum';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Trust proxy for X-Forwarded-For header (used by Cloudflare, nginx, etc)
app.set('trust proxy', 1);

// CORS Configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://develops-grad-apartment-picture.trycloudflare.com',
      'https://gojoforums.site'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Global Security Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Per-route rate limiters (avoid globally blocking an IP for benign heavy endpoints like chat)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30, // login/register attempts per 15 minutes per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});

// Lightweight global limiter for other API routes (higher threshold)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, slow down.' }
});

app.use(express.static('public'));

// Apply auth-specific rate limiter to authentication routes
app.use('/api/auth', authLimiter, authRoutes);

// Apply permissive API limiter to forum routes (message-specific limits live inside the forum router)
app.use('/api/forum', apiLimiter, forumRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (Network Accessible)`);
});
