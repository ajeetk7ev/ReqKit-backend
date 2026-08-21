import { ApiError } from '../utils/ApiError.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests for non-existent routes.
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route Not Found - ${req.originalUrl}`);
  next(error);
};

export { notFoundHandler };
