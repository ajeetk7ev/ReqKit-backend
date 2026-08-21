import { CollectionService } from '../services/collection.service.js';
import { CollectionValidation } from '../validations/collection.validation.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class CollectionController {
  /**
   * Create a new collection
   */
  static createCollection = asyncHandler(async (req, res) => {
    const validatedData = CollectionValidation.validateCreateCollection(req.body);
    const collection = await CollectionService.createCollection(req.user._id, validatedData);

    return res
      .status(201)
      .json(new ApiResponse(201, collection, 'Collection created successfully'));
  });

  /**
   * Get all collections for a workspace
   */
  static getWorkspaceCollections = asyncHandler(async (req, res) => {
    const collections = await CollectionService.getWorkspaceCollections(req.params.workspaceId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, collections, 'Workspace collections retrieved successfully'));
  });

  /**
   * Get single collection details by ID
   */
  static getCollectionDetails = asyncHandler(async (req, res) => {
    const collection = await CollectionService.getCollectionDetails(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, collection, 'Collection details retrieved successfully'));
  });

  /**
   * Update collection details or variables
   */
  static updateCollection = asyncHandler(async (req, res) => {
    const validatedData = CollectionValidation.validateUpdateCollection(req.body);
    const collection = await CollectionService.updateCollection(req.params.id, req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, collection, 'Collection updated successfully'));
  });

  /**
   * Delete collection
   */
  static deleteCollection = asyncHandler(async (req, res) => {
    await CollectionService.deleteCollection(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Collection deleted successfully'));
  });

  /**
   * Create a sub-collection folder inside collection
   */
  static createFolder = asyncHandler(async (req, res) => {
    const validatedData = CollectionValidation.validateCreateFolder(req.body);
    const collection = await CollectionService.createFolder(req.params.id, req.user._id, validatedData);

    return res
      .status(201)
      .json(new ApiResponse(201, collection, 'Sub-collection folder created successfully'));
  });

  /**
   * Update a sub-collection folder inside collection
   */
  static updateFolder = asyncHandler(async (req, res) => {
    const validatedData = CollectionValidation.validateUpdateFolder(req.body);
    const collection = await CollectionService.updateFolder(
      req.params.id,
      req.params.folderId,
      req.user._id,
      validatedData
    );

    return res
      .status(200)
      .json(new ApiResponse(200, collection, 'Sub-collection folder updated successfully'));
  });

  /**
   * Delete a sub-collection folder from collection
   */
  static deleteFolder = asyncHandler(async (req, res) => {
    const collection = await CollectionService.deleteFolder(
      req.params.id,
      req.params.folderId,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, collection, 'Sub-collection folder deleted successfully'));
  });
}
