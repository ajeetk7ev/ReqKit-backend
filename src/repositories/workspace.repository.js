import Workspace from '../models/workspace.model.js';

/**
 * Workspace Repository
 * Data Access Layer for Workspace Mongoose Model.
 */
export class WorkspaceRepository {
  /**
   * Create new workspace
   * @param {Object} workspaceData 
   * @returns {Promise<Object>}
   */
  static async create(workspaceData) {
    return await Workspace.create(workspaceData);
  }

  /**
   * Find workspace by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return await Workspace.findById(id);
  }

  /**
   * Find workspace by ID with populated owner and members
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async findByIdWithMembers(id) {
    return await Workspace.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  }

  /**
   * Find all workspaces where user is owner or member
   * @param {string} userId 
   * @returns {Promise<Array>}
   */
  static async findUserWorkspaces(userId) {
    return await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  /**
   * Update workspace details
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  static async update(id, updateData) {
    return await Workspace.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  }

  /**
   * Delete workspace
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  static async delete(id) {
    return await Workspace.findByIdAndDelete(id);
  }

  /**
   * Add member to workspace
   * @param {string} workspaceId 
   * @param {string} userId 
   * @param {string} role 
   * @returns {Promise<Object|null>}
   */
  static async addMember(workspaceId, userId, role = 'editor') {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { $push: { members: { user: userId, role, joinedAt: new Date() } } },
      { new: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  }

  /**
   * Update member role in workspace
   * @param {string} workspaceId 
   * @param {string} userId 
   * @param {string} role 
   * @returns {Promise<Object|null>}
   */
  static async updateMemberRole(workspaceId, userId, role) {
    return await Workspace.findOneAndUpdate(
      { _id: workspaceId, 'members.user': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  }

  /**
   * Remove member from workspace
   * @param {string} workspaceId 
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  static async removeMember(workspaceId, userId) {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { $pull: { members: { user: userId } } },
      { new: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  }
}
