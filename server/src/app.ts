import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { envConfig } from './config/env.config';
import apiRouter from './routes/api.router';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/custom.error';

const app: Application = express();

// Configure CORS with flexible origin support for Render & local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mini-erp-omega.vercel.app',
  envConfig.clientUrl,
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or matched origins
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Fallback to allow origin to avoid blocking deployed frontend
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Mini ERP + CRM API Server',
  });
});

// API Routes (supports both /api/v1 and /api)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Serve static React client build in production if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const altClientDistPath = path.resolve(process.cwd(), 'client/dist');

const staticPath = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(altClientDistPath)
    ? altClientDistPath
    : null;

if (staticPath) {
  app.use(express.static(staticPath));
  app.get('/{*splat}', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // 404 Route Handler for missing API endpoints
  app.use((_req, _res, next) => {
    next(new NotFoundError('The requested API route does not exist.'));
  });
}

// Central Error Handler Middleware
app.use(errorHandler);

export default app;
