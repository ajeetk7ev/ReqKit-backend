import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { ApiResponse } from './utils/ApiResponse.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Configure Passport Strategies
configurePassport();

// Enable CORS with Credentials Support
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Standard Body & Cookie Parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { uptime: process.uptime(), timestamp: new Date() }, 'ReqKit API Server Health Check OK')
  );
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/collections', collectionRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Centralized Error Handler Middleware
app.use(errorHandler);

export { app };