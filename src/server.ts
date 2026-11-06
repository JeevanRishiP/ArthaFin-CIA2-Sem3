import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import authRoutes from './routes/authRoutes';
import marketRoutes from './routes/marketRoutes';
import financeRoutes from './routes/financeRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine static assets directory (works both in development with ts-node and production dist)
const primaryPublicDir = path.join(__dirname, 'public');
const fallbackPublicDir = path.join(process.cwd(), 'src', 'public');
const publicDir = fs.existsSync(primaryPublicDir) ? primaryPublicDir : fallbackPublicDir;

app.use(express.static(publicDir));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/finance', financeRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Powered Financial Chatbot API',
  });
});

// Fallback to index.html for unmatched routes
app.use((_req: Request, res: Response) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found: Web interface assets missing in public directory.');
  }
});

// Start Express server locally (on Vercel, the app is exported as a serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Financial Chatbot Server listening on port ${PORT}`);
    console.log(`🌐 Web UI: http://localhost:${PORT}`);
    console.log(`📡 API Chat Endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`===============================================`);
  });
}

export default app;

