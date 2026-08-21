import { RequestService } from '../services/request.service.js';
import { RequestValidation } from '../validations/request.validation.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class RequestController {
  /**
   * Create a new request specification
   */
  static createRequest = asyncHandler(async (req, res) => {
    const validatedData = RequestValidation.validateCreateRequest(req.body);
    const request = await RequestService.createRequest(req.user._id, validatedData);

    return res
      .status(201)
      .json(new ApiResponse(201, request, 'Request endpoint created successfully'));
  });

  /**
   * Get all requests inside a collection
   */
  static getCollectionRequests = asyncHandler(async (req, res) => {
    const requests = await RequestService.getCollectionRequests(req.params.collectionId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, requests, 'Collection requests retrieved successfully'));
  });

  /**
   * Get single request endpoint details with saved response examples
   */
  static getRequestDetails = asyncHandler(async (req, res) => {
    const request = await RequestService.getRequestDetails(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, request, 'Request details retrieved successfully'));
  });

  /**
   * Update request specification
   */
  static updateRequest = asyncHandler(async (req, res) => {
    const validatedData = RequestValidation.validateUpdateRequest(req.body);
    const request = await RequestService.updateRequest(req.params.id, req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, request, 'Request endpoint updated successfully'));
  });

  /**
   * Delete request specification
   */
  static deleteRequest = asyncHandler(async (req, res) => {
    await RequestService.deleteRequest(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Request endpoint deleted successfully'));
  });

  /**
   * Proxy execute live HTTP request (Live Runner Engine)
   */
  static executeRequest = asyncHandler(async (req, res) => {
    const validatedData = RequestValidation.validateExecuteRequest(req.body);
    const result = await RequestService.executeRequest(req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Live HTTP request executed successfully'));
  });

  /**
   * Save a response example snapshot for an endpoint
   */
  static saveResponseExample = asyncHandler(async (req, res) => {
    const validatedData = RequestValidation.validateSaveExample(req.body);
    const example = await RequestService.saveResponseExample(req.params.id, req.user._id, validatedData);

    return res
      .status(201)
      .json(new ApiResponse(201, example, 'Response example saved successfully'));
  });

  /**
   * Get all saved response examples for an endpoint
   */
  static getRequestExamples = asyncHandler(async (req, res) => {
    const examples = await RequestService.getRequestExamples(req.params.id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, examples, 'Response examples retrieved successfully'));
  });

  /**
   * Delete a saved response example
   */
  static deleteResponseExample = asyncHandler(async (req, res) => {
    await RequestService.deleteResponseExample(req.params.exampleId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Response example deleted successfully'));
  });
}
