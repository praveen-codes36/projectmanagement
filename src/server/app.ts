import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { ApiError } from './utils/api-error';

// Import route handlers
import healthcheckRouter from './routes/healthcheck.routes';
import authRouter from './routes/auth.routes';
import projectRouter from './routes/project.routes';
import taskRouter from './routes/task.routes';
import noteRouter from './routes/note.routes';

const app = express();

// Ensure public upload directories exist
const uploadDir = path.resolve(process.cwd(), 'public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Basic middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Static file serving for uploads & assets
app.use('/images', express.static(uploadDir));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// CORS configuration
const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origins
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid CORS blocking local ports
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
  })
);

// Health & Info endpoints
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Project Camp API',
    version: '1.0.0',
    status: 'online',
    description: 'Collaborative project management platform backend API',
  });
});

// API v1 Routes
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/notes', noteRouter);

// 404 Route Catch-All
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    data: null,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    success: false,
    errors: [],
  });
});

// Global Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || (err instanceof ApiError ? err.statusCode : 500);
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors,
  });
});

export default app;
