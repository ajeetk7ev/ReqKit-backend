import { UserRepository } from '../repositories/user.repository.js';
import { PasswordUtil } from '../utils/password.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Service
 * Encapsulates core business logic for user registration, login, token management, and logout.
 */
export class AuthService {
  /**
   * Helper method to generate access and refresh tokens and persist refresh token in DB
   * @param {Object} user 
   * @returns {Promise<{accessToken: string, refreshToken: string, user: Object}>}
   */
  static async generateAuthTokens(user) {
    const payload = { userId: user._id, email: user.email };
    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    await UserRepository.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: user.toJSON ? user.toJSON() : user,
    };
  }

  /**
   * Register a new user with Email and Password
   * @param {Object} registerDto 
   */
  static async registerUser({ name, email, password }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email address');
    }

    const passwordHash = await PasswordUtil.hashPassword(password);
    const newUser = await UserRepository.create({
      name,
      email,
      passwordHash,
    });

    return await this.generateAuthTokens(newUser);
  }

  /**
   * Authenticate user with Email and Password
   * @param {Object} loginDto 
   */
  static async loginUser({ email, password }) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await PasswordUtil.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    return await this.generateAuthTokens(user);
  }

  /**
   * Refresh Access & Refresh Tokens using valid Refresh Token
   * @param {string} incomingRefreshToken 
   */
  static async refreshTokens(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = JwtUtil.verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    return await this.generateAuthTokens(user);
  }

  /**
   * Handle Google OAuth Login / Register Callback
   * @param {Object} user 
   */
  static async handleGoogleAuth(user) {
    if (!user) {
      throw new ApiError(401, 'Google authentication failed');
    }
    return await this.generateAuthTokens(user);
  }

  /**
   * Logout user by clearing stored Refresh Token
   * @param {string} userId 
   */
  static async logoutUser(userId) {
    if (userId) {
      await UserRepository.updateRefreshToken(userId, null);
    }
    return true;
  }
}
