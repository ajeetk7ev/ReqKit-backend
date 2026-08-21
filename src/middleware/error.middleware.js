import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global Error Handler Middleware
 * Intercepts all errors thrown in routes, controllers, and services.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}`;
    error = new ApiError(400, message, [{ field, message }]);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle JWT Validation Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired');
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${error.statusCode} - ${error.message}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors && error.errors.length > 0 ? error.errors : [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
