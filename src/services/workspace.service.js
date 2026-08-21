import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Workspace Service
 * Encapsulates business logic, permission checks, and team management for Workspaces.
 */
export class WorkspaceService {
  /**
   * Helper to verify if a user has access to a workspace and get their effective role
   * @param {Object} workspace 
   * @param {string} userId 
   * @returns {'owner' | 'editor' | 'viewer' | null}
   */
  static getUserRoleInWorkspace(workspace, userId) {
    const userIdStr = userId.toString();
    if (workspace.owner._id ? workspace.owner._id.toString() === userIdStr : workspace.owner.toString() === userIdStr) {
      return 'owner';
    }
    const member = workspace.members.find(
      (m) => (m.user._id ? m.user._id.toString() === userIdStr : m.user.toString() === userIdStr)
    );
    return member ? member.role : null;
  }

  /**
   * Create a new workspace
   * @param {string} userId 
   * @param {Object} createDto 
   */
  static async createWorkspace(userId, { name, description, isPersonal = false }) {
    const workspace = await WorkspaceRepository.create({
      name,
      description,
      owner: userId,
      isPersonal,
      members: [{ user: userId, role: 'owner', joinedAt: new Date() }],
    });

    return await WorkspaceRepository.findByIdWithMembers(workspace._id);
  }

  /**
   * Get all workspaces for the authenticated user
   * @param {string} userId 
   */
  static async getUserWorkspaces(userId) {
    let workspaces = await WorkspaceRepository.findUserWorkspaces(userId);

    // If user has no workspace yet, automatically create a default personal workspace
    if (workspaces.length === 0) {
      const user = await UserRepository.findById(userId);
      const personalWorkspace = await this.createWorkspace(userId, {
        name: `${user ? user.name : 'Personal'}'s Workspace`,
        description: 'Default personal workspace',
        isPersonal: true,
      });
      return [personalWorkspace];
    }

    return workspaces;
  }

  /**
   * Get single workspace details by ID
   * @param {string} workspaceId 
   * @param {string} userId 
   */
  static async getWorkspaceDetails(workspaceId, userId) {
    const workspace = await WorkspaceRepository.findByIdWithMembers(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const role = this.getUserRoleInWorkspace(workspace, userId);
    if (!role) {
      throw new ApiError(403, 'Access denied to this workspace');
    }

    const workspaceObj = workspace.toObject ? workspace.toObject() : workspace;
    workspaceObj.currentUserRole = role;
    return workspaceObj;
  }

  /**
   * Update workspace details (Requires owner or editor role)
   * @param {string} workspaceId 
   * @param {string} userId 
   * @param {Object} updateDto 
   */
  static async updateWorkspace(workspaceId, userId, updateDto) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const role = this.getUserRoleInWorkspace(workspace, userId);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new ApiError(403, 'Permission denied - Only workspace owners and editors can update details');
    }

    return await WorkspaceRepository.update(workspaceId, updateDto);
  }

  /**
   * Delete workspace (Requires owner role)
   * @param {string} workspaceId 
   * @param {string} userId 
   */
  static async deleteWorkspace(workspaceId, userId) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const role = this.getUserRoleInWorkspace(workspace, userId);
    if (role !== 'owner') {
      throw new ApiError(403, 'Permission denied - Only the workspace owner can delete this workspace');
    }

    await WorkspaceRepository.delete(workspaceId);
    return true;
  }

  /**
   * Add a team member to workspace by email (Requires owner or editor role)
   * @param {string} workspaceId 
   * @param {string} currentUserId 
   * @param {Object} addMemberDto 
   */
  static async addMemberByEmail(workspaceId, currentUserId, { email, role = 'editor' }) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const currentRole = this.getUserRoleInWorkspace(workspace, currentUserId);
    if (!currentRole || (currentRole !== 'owner' && currentRole !== 'editor')) {
      throw new ApiError(403, 'Permission denied - Only workspace owners and editors can invite members');
    }

    const userToInvite = await UserRepository.findByEmail(email);
    if (!userToInvite) {
      throw new ApiError(404, `No user found with email ${email}`);
    }

    const existingRole = this.getUserRoleInWorkspace(workspace, userToInvite._id);
    if (existingRole) {
      throw new ApiError(400, 'User is already a member of this workspace');
    }

    return await WorkspaceRepository.addMember(workspaceId, userToInvite._id, role);
  }

  /**
   * Update member role (Requires owner role)
   * @param {string} workspaceId 
   * @param {string} currentUserId 
   * @param {string} targetUserId 
   * @param {string} newRole 
   */
  static async updateMemberRole(workspaceId, currentUserId, targetUserId, newRole) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const currentRole = this.getUserRoleInWorkspace(workspace, currentUserId);
    if (currentRole !== 'owner') {
      throw new ApiError(403, 'Permission denied - Only the workspace owner can update member roles');
    }

    return await WorkspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  /**
   * Remove member from workspace (Requires owner role or self-leave)
   * @param {string} workspaceId 
   * @param {string} currentUserId 
   * @param {string} targetUserId 
   */
  static async removeMember(workspaceId, currentUserId, targetUserId) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const currentRole = this.getUserRoleInWorkspace(workspace, currentUserId);
    const isSelfLeave = currentUserId.toString() === targetUserId.toString();

    if (!isSelfLeave && currentRole !== 'owner') {
      throw new ApiError(403, 'Permission denied - Only workspace owners can remove members');
    }

    // Owner cannot be removed from workspace
    if (workspace.owner.toString() === targetUserId.toString()) {
      throw new ApiError(400, 'Workspace owner cannot be removed from the workspace');
    }

    return await WorkspaceRepository.removeMember(workspaceId, targetUserId);
  }
}
