import { ExportService } from '../services/export.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ExportController {
  /**
   * Export Single Request Endpoint for AI Agents
   */
  static exportRequest = asyncHandler(async (req, res) => {
    const result = await ExportService.exportRequest(req.params.requestId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Single API request exported successfully for AI Agents'));
  });

  /**
   * Export Sub-Collection / Folder Endpoints for AI Agents
   */
  static exportFolder = asyncHandler(async (req, res) => {
    const result = await ExportService.exportFolder(
      req.params.collectionId,
      req.params.folderId,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Sub-collection folder exported successfully for AI Agents'));
  });

  /**
   * Export Complete Collection for AI Agents
   */
  static exportCollection = asyncHandler(async (req, res) => {
    const result = await ExportService.exportCollection(req.params.collectionId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Complete collection exported successfully for AI Agents'));
  });
}
