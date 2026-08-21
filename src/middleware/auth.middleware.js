import { JwtUtil } from '../utils/jwt.util.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Authentication Guard Middleware
 * Extracts Access Token from HTTP-only Cookies or Authorization Bearer Header.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Unauthorized request - Access token is missing');
  }

  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    const user = await UserRepository.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token - User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || 'Invalid or expired access token');
  }
});
