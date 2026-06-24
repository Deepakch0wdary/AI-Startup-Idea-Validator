import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import ideasRoutes from './routes/ideas.js';
import reportsRoutes from './routes/reports.js';
import mentorRoutes from './routes/mentor.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Log incoming requests for dev debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling (must be registered last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Enterprise AI Validator server running on port ${PORT}`);
});
