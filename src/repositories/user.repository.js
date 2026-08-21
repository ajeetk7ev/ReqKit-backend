import User from '../models/user.model.js';

/**
 * User Repository
 * Data Access Layer for User Mongoose Model.
 */
export class UserRepository {
  /**
   * Find user by email including passwordHash for authentication
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  static async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+passwordHash +refreshToken');
  }

  /**
   * Find user by email
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Find user by ID
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  static async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find user by Google ID
   * @param {string} googleId 
   * @returns {Promise<Object|null>}
   */
  static async findByGoogleId(googleId) {
    return await User.findOne({ googleId });
  }

  /**
   * Create new user record
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    return await User.create(userData);
  }

  /**
   * Update stored refresh token for user
   * @param {string} userId 
   * @param {string|null} refreshToken 
   * @returns {Promise<Object|null>}
   */
  static async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }
}
