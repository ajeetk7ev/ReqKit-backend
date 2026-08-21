import Request from '../models/request.model.js';

/**
 * Request Repository
 * Data Access Layer for Request Mongoose Model.
 */
export class RequestRepository {
  /**
   * Create new API request endpoint specification
   * @param {Object} requestData 
   * @returns {Promise<Object>}
   */
  static async create(requestData) {
    return await Request.create(requestData);
  }

  /**
   * Find request by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return await Request.findById(id);
  }

  /**
   * Find all requests inside a collection
   * @param {string} collectionId 
   * @returns {Promise<Array>}
   */
  static async findByCollectionId(collectionId) {
    return await Request.find({ collectionId }).sort({ createdAt: 1 });
  }

  /**
   * Find all requests inside a sub-collection folder
   * @param {string} folderId 
   * @returns {Promise<Array>}
   */
  static async findByFolderId(folderId) {
    return await Request.find({ folderId }).sort({ createdAt: 1 });
  }

  /**
   * Update request specification
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  static async update(id, updateData) {
    return await Request.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete request specification
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async delete(id) {
    return await Request.findByIdAndDelete(id);
  }

  /**
   * Delete all requests belonging to a collection
   * @param {string} collectionId 
   * @returns {Promise<Object>}
   */
  static async deleteManyByCollectionId(collectionId) {
    return await Request.deleteMany({ collectionId });
  }
}
