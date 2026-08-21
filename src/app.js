import express from 'express';
import cors from 'cors';
import { ApiResponse } from './utils/ApiResponse.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Standard Body Parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { uptime: process.uptime(), timestamp: new Date() }, 'ReqKit API Server Health Check OK')
  );
});

// Catch 404 routes
app.use(notFoundHandler);

// Centralized Error Handler Middleware
app.use(errorHandler);

export { app };