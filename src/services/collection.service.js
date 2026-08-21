import { CollectionRepository } from '../repositories/collection.repository.js';
import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Collection Service
 * Business logic and permission verification for Collections and Sub-collection Folders.
 */
export class CollectionService {
  /**
   * Internal permission check helper
   * @param {string} workspaceId 
   * @param {string} userId 
   * @returns {Promise<'owner'|'editor'|'viewer'>}
   */
  static async verifyWorkspaceAccess(workspaceId, userId, allowedRoles = ['owner', 'editor', 'viewer']) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const userIdStr = userId.toString();
    const isOwner = workspace.owner.toString() === userIdStr;
    const member = workspace.members.find((m) => m.user.toString() === userIdStr);

    const userRole = isOwner ? 'owner' : member ? member.role : null;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ApiError(403, 'Permission denied for this workspace collection');
    }

    return userRole;
  }

  /**
   * Create a new collection under a workspace
   * @param {string} userId 
   * @param {Object} createDto 
   */
  static async createCollection(userId, { workspaceId, name, description, variables = [] }) {
    await this.verifyWorkspaceAccess(workspaceId, userId, ['owner', 'editor']);

    return await CollectionRepository.create({
      workspace: workspaceId,
      name,
      description,
      variables,
      folders: [],
    });
  }

  /**
   * Get all collections for a workspace
   * @param {string} workspaceId 
   * @param {string} userId 
   */
  static async getWorkspaceCollections(workspaceId, userId) {
    await this.verifyWorkspaceAccess(workspaceId, userId);
    return await CollectionRepository.findByWorkspaceId(workspaceId);
  }

  /**
   * Get collection details by ID
   * @param {string} collectionId 
   * @param {string} userId 
   */
  static async getCollectionDetails(collectionId, userId) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId);
    return collection;
  }

  /**
   * Update collection details or environment variables
   * @param {string} collectionId 
   * @param {string} userId 
   * @param {Object} updateDto 
   */
  static async updateCollection(collectionId, userId, updateDto) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId, ['owner', 'editor']);
    return await CollectionRepository.update(collectionId, updateDto);
  }

  /**
   * Delete collection
   * @param {string} collectionId 
   * @param {string} userId 
   */
  static async deleteCollection(collectionId, userId) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId, ['owner', 'editor']);
    await CollectionRepository.delete(collectionId);
    return true;
  }

  /**
   * Create a sub-collection folder inside a collection
   * @param {string} collectionId 
   * @param {string} userId 
   * @param {Object} folderDto 
   */
  static async createFolder(collectionId, userId, folderDto) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId, ['owner', 'editor']);
    return await CollectionRepository.addFolder(collectionId, folderDto);
  }

  /**
   * Update a sub-collection folder
   * @param {string} collectionId 
   * @param {string} folderId 
   * @param {string} userId 
   * @param {Object} folderDto 
   */
  static async updateFolder(collectionId, folderId, userId, folderDto) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId, ['owner', 'editor']);

    const folderExists = collection.folders.some((f) => f._id.toString() === folderId.toString());
    if (!folderExists) {
      throw new ApiError(404, 'Sub-collection folder not found');
    }

    return await CollectionRepository.updateFolder(collectionId, folderId, folderDto);
  }

  /**
   * Delete a sub-collection folder
   * @param {string} collectionId 
   * @param {string} folderId 
   * @param {string} userId 
   */
  static async deleteFolder(collectionId, folderId, userId) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    await this.verifyWorkspaceAccess(collection.workspace, userId, ['owner', 'editor']);

    const folderExists = collection.folders.some((f) => f._id.toString() === folderId.toString());
    if (!folderExists) {
      throw new ApiError(404, 'Sub-collection folder not found');
    }

    return await CollectionRepository.deleteFolder(collectionId, folderId);
  }
}
