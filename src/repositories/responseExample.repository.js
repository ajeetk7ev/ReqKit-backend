import ResponseExample from '../models/responseExample.model.js';

/**
 * Response Example Repository
 * Data Access Layer for ResponseExample Mongoose Model.
 */
export class ResponseExampleRepository {
  /**
   * Save a response example snapshot
   * @param {Object} exampleData 
   * @returns {Promise<Object>}
   */
  static async create(exampleData) {
    return await ResponseExample.create(exampleData);
  }

  /**
   * Find example by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return await ResponseExample.findById(id);
  }

  /**
   * Find all saved examples for a request
   * @param {string} requestId 
   * @returns {Promise<Array>}
   */
  static async findByRequestId(requestId) {
    return await ResponseExample.find({ requestId }).sort({ createdAt: -1 });
  }

  /**
   * Find default example for a request by type (success or error)
   * @param {string} requestId 
   * @param {'success'|'error'} type 
   * @returns {Promise<Object|null>}
   */
  static async findDefaultByRequestAndType(requestId, type) {
    return await ResponseExample.findOne({ requestId, type, isDefault: true });
  }

  /**
   * Unset all default flags for a request and type before setting new default
   * @param {string} requestId 
   * @param {'success'|'error'} type 
   */
  static async unsetDefaults(requestId, type) {
    await ResponseExample.updateMany(
      { requestId, type },
      { $set: { isDefault: false } }
    );
  }

  /**
   * Delete example by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async delete(id) {
    return await ResponseExample.findByIdAndDelete(id);
  }

  /**
   * Delete all examples associated with a request
   * @param {string} requestId 
   * @returns {Promise<Object>}
   */
  static async deleteManyByRequestId(requestId) {
    return await ResponseExample.deleteMany({ requestId });
  }
}
