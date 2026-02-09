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

// Global Rate Limiter: Prevent general DDOS (Max 500 requests per 15 mins per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (Network Accessible)`);
});
