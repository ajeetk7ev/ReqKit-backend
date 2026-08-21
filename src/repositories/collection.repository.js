import Collection from '../models/collection.model.js';

/**
 * Collection Repository
 * Data Access Layer for Collection Mongoose Model.
 */
export class CollectionRepository {
  /**
   * Create new collection
   * @param {Object} collectionData 
   * @returns {Promise<Object>}
   */
  static async create(collectionData) {
    return await Collection.create(collectionData);
  }

  /**
   * Find collection by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return await Collection.findById(id);
  }

  /**
   * Find all collections inside a workspace
   * @param {string} workspaceId 
   * @returns {Promise<Array>}
   */
  static async findByWorkspaceId(workspaceId) {
    return await Collection.find({ workspace: workspaceId }).sort({ createdAt: -1 });
  }

  /**
   * Update collection details / variables
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  static async update(id, updateData) {
    return await Collection.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete collection
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async delete(id) {
    return await Collection.findByIdAndDelete(id);
  }

  /**
   * Add a sub-collection folder to collection
   * @param {string} collectionId 
   * @param {Object} folderData 
   * @returns {Promise<Object|null>}
   */
  static async addFolder(collectionId, folderData) {
    return await Collection.findByIdAndUpdate(
      collectionId,
      { $push: { folders: folderData } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update sub-collection folder details
   * @param {string} collectionId 
   * @param {string} folderId 
   * @param {Object} folderData 
   * @returns {Promise<Object|null>}
   */
  static async updateFolder(collectionId, folderId, folderData) {
    const updateQuery = {};
    if (folderData.name) updateQuery['folders.$.name'] = folderData.name;
    if (folderData.description !== undefined) updateQuery['folders.$.description'] = folderData.description;
    if (folderData.parentId !== undefined) updateQuery['folders.$.parentId'] = folderData.parentId;

    return await Collection.findOneAndUpdate(
      { _id: collectionId, 'folders._id': folderId },
      { $set: updateQuery },
      { new: true }
    );
  }

  /**
   * Delete sub-collection folder from collection
   * @param {string} collectionId 
   * @param {string} folderId 
   * @returns {Promise<Object|null>}
   */
  static async deleteFolder(collectionId, folderId) {
    return await Collection.findByIdAndUpdate(
      collectionId,
      { $pull: { folders: { _id: folderId } } },
      { new: true }
    );
  }
}
