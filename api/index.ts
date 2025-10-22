// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import { AppDataSource } from '../backend/src/config/database';

// Import routes
import authRoutes from '../backend/src/routes/auth.routes';
import motionRoutes from '../backend/src/routes/motion.routes';
import surveyRoutes from '../backend/src/routes/survey.routes';
import userRoutes from '../backend/src/routes/user.routes';
import adminRoutes from '../backend/src/routes/admin.routes';
import commentRoutes from '../backend/src/routes/comment.routes';
import quickpollRoutes from '../backend/src/routes/quickpoll.routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize database connection
let isInitialized = false;

async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('Database connected successfully');
      isInitialized = true;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
}

// Routes
app.use('/api/auth', async (req, res, next) => {
  await initializeDatabase();
  next();
}, authRoutes);

app.use('/api/motions', async (req, res, next) => {
  await initializeDatabase();
  next();
}, motionRoutes);

app.use('/api/surveys', async (req, res, next) => {
  await initializeDatabase();
  next();
}, surveyRoutes);

app.use('/api/users', async (req, res, next) => {
  await initializeDatabase();
  next();
}, userRoutes);

app.use('/api/admin', async (req, res, next) => {
  await initializeDatabase();
  next();
}, adminRoutes);

app.use('/api/comments', async (req, res, next) => {
  await initializeDatabase();
  next();
}, commentRoutes);

app.use('/api/quickpolls', async (req, res, next) => {
  await initializeDatabase();
  next();
}, quickpollRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

export default app;
