import { RequestRepository } from '../repositories/request.repository.js';
import { CollectionRepository } from '../repositories/collection.repository.js';
import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { ResponseExampleRepository } from '../repositories/responseExample.repository.js';
import { ExecutorService } from './executor.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Request Service
 * Business logic and permission verification for Request specifications, live runner, and saved response examples.
 */
export class RequestService {
  /**
   * Internal workspace access verification helper
   * @param {string} collectionId 
   * @param {string} userId 
   * @param {Array<string>} allowedRoles 
   */
  static async verifyCollectionAccess(collectionId, userId, allowedRoles = ['owner', 'editor', 'viewer']) {
    const collection = await CollectionRepository.findById(collectionId);
    if (!collection) {
      throw new ApiError(404, 'Collection not found');
    }

    const workspace = await WorkspaceRepository.findById(collection.workspace);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const userIdStr = userId.toString();
    const isOwner = workspace.owner.toString() === userIdStr;
    const member = workspace.members.find((m) => m.user.toString() === userIdStr);

    const userRole = isOwner ? 'owner' : member ? member.role : null;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ApiError(403, 'Permission denied for this collection request');
    }

    return { collection, workspace, userRole };
  }

  /**
   * Create a new API request endpoint specification
   * @param {string} userId 
   * @param {Object} createDto 
   */
  static async createRequest(userId, createDto) {
    await this.verifyCollectionAccess(createDto.collectionId, userId, ['owner', 'editor']);
    return await RequestRepository.create(createDto);
  }

  /**
   * Get all requests inside a collection
   * @param {string} collectionId 
   * @param {string} userId 
   */
  static async getCollectionRequests(collectionId, userId) {
    await this.verifyCollectionAccess(collectionId, userId);
    return await RequestRepository.findByCollectionId(collectionId);
  }

  /**
   * Get request details by ID
   * @param {string} requestId 
   * @param {string} userId 
   */
  static async getRequestDetails(requestId, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyCollectionAccess(request.collectionId, userId);
    const examples = await ResponseExampleRepository.findByRequestId(requestId);

    const requestObj = request.toObject ? request.toObject() : request;
    requestObj.savedExamples = examples;
    return requestObj;
  }

  /**
   * Update request specification
   * @param {string} requestId 
   * @param {string} userId 
   * @param {Object} updateDto 
   */
  static async updateRequest(requestId, userId, updateDto) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyCollectionAccess(request.collectionId, userId, ['owner', 'editor']);
    return await RequestRepository.update(requestId, updateDto);
  }

  /**
   * Delete request specification and all associated saved response examples
   * @param {string} requestId 
   * @param {string} userId 
   */
  static async deleteRequest(requestId, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyCollectionAccess(request.collectionId, userId, ['owner', 'editor']);
    await ResponseExampleRepository.deleteManyByRequestId(requestId);
    await RequestRepository.delete(requestId);
    return true;
  }

  /**
   * Proxy Execute Live HTTP Request
   * @param {string} userId 
   * @param {Object} executeDto 
   */
  static async executeRequest(userId, executeDto) {
    return await ExecutorService.execute(executeDto);
  }

  /**
   * Save live response snapshot as Response Example for an endpoint
   * @param {string} requestId 
   * @param {string} userId 
   * @param {Object} exampleDto 
   */
  static async saveResponseExample(requestId, userId, exampleDto) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyCollectionAccess(request.collectionId, userId, ['owner', 'editor']);

    if (exampleDto.isDefault) {
      await ResponseExampleRepository.unsetDefaults(requestId, exampleDto.type);
    }

    return await ResponseExampleRepository.create({
      ...exampleDto,
      requestId,
    });
  }

  /**
   * Get all saved response examples for an endpoint
   * @param {string} requestId 
   * @param {string} userId 
   */
  static async getRequestExamples(requestId, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyCollectionAccess(request.collectionId, userId);
    return await ResponseExampleRepository.findByRequestId(requestId);
  }

  /**
   * Delete a saved response example
   * @param {string} exampleId 
   * @param {string} userId 
   */
  static async deleteResponseExample(exampleId, userId) {
    const example = await ResponseExampleRepository.findById(exampleId);
    if (!example) {
      throw new ApiError(404, 'Response example not found');
    }

    const request = await RequestRepository.findById(example.requestId);
    if (request) {
      await this.verifyCollectionAccess(request.collectionId, userId, ['owner', 'editor']);
    }

    await ResponseExampleRepository.delete(exampleId);
    return true;
  }
}
