import { WorkspaceService } from '../services/workspace.service.js';
import { WorkspaceValidation } from '../validations/workspace.validation.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class WorkspaceController {
  /**
   * Create a new workspace
   */
  static createWorkspace = asyncHandler(async (req, res) => {
    const validatedData = WorkspaceValidation.validateCreateWorkspace(req.body);
    const workspace = await WorkspaceService.createWorkspace(req.user._id, validatedData);

    return res
      .status(201)
      .json(new ApiResponse(201, workspace, 'Workspace created successfully'));
  });

  /**
   * Get all workspaces for authenticated user
   */
  static getUserWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await WorkspaceService.getUserWorkspaces(req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, workspaces, 'User workspaces retrieved successfully'));
  });

  /**
   * Get single workspace details by ID
   */
  static getWorkspaceDetails = asyncHandler(async (req, res) => {
    const workspace = await WorkspaceService.getWorkspaceDetails(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, 'Workspace details retrieved successfully'));
  });

  /**
   * Update workspace details
   */
  static updateWorkspace = asyncHandler(async (req, res) => {
    const validatedData = WorkspaceValidation.validateUpdateWorkspace(req.body);
    const workspace = await WorkspaceService.updateWorkspace(req.params.id, req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, 'Workspace updated successfully'));
  });

  /**
   * Delete workspace
   */
  static deleteWorkspace = asyncHandler(async (req, res) => {
    await WorkspaceService.deleteWorkspace(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Workspace deleted successfully'));
  });

  /**
   * Add a team member by email
   */
  static addMember = asyncHandler(async (req, res) => {
    const validatedData = WorkspaceValidation.validateAddMember(req.body);
    const workspace = await WorkspaceService.addMemberByEmail(req.params.id, req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, 'Team member added to workspace successfully'));
  });

  /**
   * Update member role in workspace
   */
  static updateMemberRole = asyncHandler(async (req, res) => {
    const validatedData = WorkspaceValidation.validateUpdateMemberRole(req.body);
    const workspace = await WorkspaceService.updateMemberRole(
      req.params.id,
      req.user._id,
      req.params.userId,
      validatedData.role
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, 'Member role updated successfully'));
  });

  /**
   * Remove member from workspace
   */
  static removeMember = asyncHandler(async (req, res) => {
    const workspace = await WorkspaceService.removeMember(req.params.id, req.user._id, req.params.userId);

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, 'Member removed from workspace successfully'));
  });
}
