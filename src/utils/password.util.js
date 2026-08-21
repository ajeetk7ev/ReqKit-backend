import bcrypt from 'bcryptjs';

/**
 * Password Utility
 * Provides static helper methods for password hashing and comparison.
 */
export class PasswordUtil {
  /**
   * Hashes plain text password
   * @param {string} password 
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compares plain text password with hashed password
   * @param {string} enteredPassword 
   * @param {string} hashedPassword 
   * @returns {Promise<boolean>}
   */
  static async comparePassword(enteredPassword, hashedPassword) {
    if (!enteredPassword || !hashedPassword) return false;
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
}
