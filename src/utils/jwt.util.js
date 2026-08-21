import jwt from 'jsonwebtoken';

/**
 * JWT Utility
 * Provides static helper methods for generating and verifying access and refresh tokens.
 */
export class JwtUtil {
  /**
   * Generates short-lived Access Token
   * @param {Object} payload 
   * @returns {string}
   */
  static generateAccessToken(payload) {
    const secret = process.env.ACCESS_TOKEN_SECRET || 'reqkit_access_secret_key_12345';
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION || '1d';
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Generates long-lived Refresh Token
   * @param {Object} payload 
   * @returns {string}
   */
  static generateRefreshToken(payload) {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'reqkit_refresh_secret_key_67890';
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verifies Access Token
   * @param {string} token 
   * @returns {Object}
   */
  static verifyAccessToken(token) {
    const secret = process.env.ACCESS_TOKEN_SECRET || 'reqkit_access_secret_key_12345';
    return jwt.verify(token, secret);
  }

  /**
   * Verifies Refresh Token
   * @param {string} token 
   * @returns {Object}
   */
  static verifyRefreshToken(token) {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'reqkit_refresh_secret_key_67890';
    return jwt.verify(token, secret);
  }
}
