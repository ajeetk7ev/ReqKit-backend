import { RequestRepository } from '../repositories/request.repository.js';
import { CollectionRepository } from '../repositories/collection.repository.js';
import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { ResponseExampleRepository } from '../repositories/responseExample.repository.js';
import { TypeGeneratorService } from './typeGenerator.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * AI-Agent Export Engine Service
 * Generates token-dense ReqKit AI JSON, Markdown Context Prompts, and TypeScript Interfaces for LLM consumption.
 */
export class ExportService {
  /**
   * Internal permission check helper
   * @param {string} collectionId 
   * @param {string} userId 
   */
  static async verifyAccess(collectionId, userId) {
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
    const isMember = workspace.members.some((m) => m.user.toString() === userIdStr);

    if (!isOwner && !isMember) {
      throw new ApiError(403, 'Permission denied to export this collection');
    }

    return { collection, workspace };
  }

  /**
   * Formats an individual request specification into AI-ready format
   * @param {Object} request 
   * @param {Array} savedExamples 
   */
  static buildCleanRequestJson(request, savedExamples = []) {
    const enabledHeaders = (request.headers || [])
      .filter((h) => h.enabled && h.key)
      .map((h) => ({ key: h.key, value: h.value }));

    const enabledParams = (request.queryParams || [])
      .filter((p) => p.enabled && p.key)
      .map((p) => ({ key: p.key, value: p.value }));

    let parsedBody = null;
    if (request.body?.type === 'json' && request.body.rawContent) {
      try {
        parsedBody = JSON.parse(request.body.rawContent);
      } catch (e) {
        parsedBody = request.body.rawContent;
      }
    } else if (request.body?.type === 'form-data' || request.body?.type === 'x-www-form-urlencoded') {
      parsedBody = (request.body.formData || [])
        .filter((f) => f.enabled && f.key)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    } else if (request.body?.rawContent) {
      parsedBody = request.body.rawContent;
    }

    const successExample = savedExamples.find((ex) => ex.type === 'success' || (ex.statusCode >= 200 && ex.statusCode < 400));
    const failureExamples = savedExamples.filter((ex) => ex.type === 'error' || ex.statusCode >= 400);

    const typeScriptTypes = TypeGeneratorService.generateEndpointTypes(
      request.name,
      request.body,
      successExample,
      failureExamples
    );

    return {
      id: request._id,
      name: request.name,
      description: request.description || '',
      method: request.method,
      url: request.url,
      headers: enabledHeaders,
      queryParams: enabledParams,
      pathParams: request.pathParams || [],
      requestBody: {
        format: request.body?.type || 'none',
        sample: parsedBody,
      },
      responses: {
        success: successExample
          ? {
              status: successExample.statusCode,
              title: successExample.title,
              sample: successExample.body,
            }
          : null,
        failures: failureExamples.map((ex) => ({
          status: ex.statusCode,
          title: ex.title,
          sample: ex.body,
        })),
      },
      typeScriptTypes,
    };
  }

  /**
   * Builds Markdown Context Prompt for AI coding agents
   * @param {Object} exportData 
   */
  static buildMarkdownPrompt(exportData) {
    const mdLines = [];

    mdLines.push(`# API Specification Contract for AI Agent Integration: ${exportData.title}`);
    mdLines.push(`*Exported Scope*: \`${exportData.scope}\` | *Total Endpoints*: ${exportData.totalEndpoints}\n`);

    exportData.endpoints.forEach((ep, index) => {
      mdLines.push(`---`);
      mdLines.push(`## Endpoint ${index + 1}: ${ep.name}`);
      mdLines.push(`**HTTP Method & Path**: \`${ep.method} ${ep.url}\``);
      if (ep.description) {
        mdLines.push(`**Description**: ${ep.description}`);
      }
      mdLines.push('');

      if (ep.headers && ep.headers.length > 0) {
        mdLines.push(`### Request Headers:`);
        ep.headers.forEach((h) => mdLines.push(`- \`${h.key}\`: \`${h.value}\``));
        mdLines.push('');
      }

      if (ep.queryParams && ep.queryParams.length > 0) {
        mdLines.push(`### Query Parameters:`);
        ep.queryParams.forEach((p) => mdLines.push(`- \`${p.key}\`: \`${p.value}\``));
        mdLines.push('');
      }

      if (ep.requestBody && ep.requestBody.sample) {
        mdLines.push(`### Request Body (${ep.requestBody.format.toUpperCase()}):`);
        mdLines.push('```json');
        mdLines.push(typeof ep.requestBody.sample === 'object' ? JSON.stringify(ep.requestBody.sample, null, 2) : String(ep.requestBody.sample));
        mdLines.push('```\n');
      }

      if (ep.responses.success) {
        mdLines.push(`### Success Response (${ep.responses.success.status}):`);
        mdLines.push('```json');
        mdLines.push(typeof ep.responses.success.sample === 'object' ? JSON.stringify(ep.responses.success.sample, null, 2) : String(ep.responses.success.sample || ''));
        mdLines.push('```\n');
      }

      if (ep.responses.failures && ep.responses.failures.length > 0) {
        mdLines.push(`### Failure Responses:`);
        ep.responses.failures.forEach((f) => {
          mdLines.push(`#### Status ${f.status} (${f.title}):`);
          mdLines.push('```json');
          mdLines.push(typeof f.sample === 'object' ? JSON.stringify(f.sample, null, 2) : String(f.sample || ''));
          mdLines.push('```');
        });
        mdLines.push('');
      }

      if (ep.typeScriptTypes) {
        mdLines.push(`### TypeScript Interfaces:`);
        mdLines.push('```typescript');
        mdLines.push(ep.typeScriptTypes);
        mdLines.push('```\n');
      }
    });

    return mdLines.join('\n');
  }

  /**
   * Export Single Request
   * @param {string} requestId 
   * @param {string} userId 
   */
  static async exportRequest(requestId, userId) {
    const request = await RequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request endpoint not found');
    }

    await this.verifyAccess(request.collectionId, userId);
    const examples = await ResponseExampleRepository.findByRequestId(requestId);
    const endpointJson = this.buildCleanRequestJson(request, examples);

    const exportData = {
      reqkitVersion: '1.0',
      exportedAt: new Date().toISOString(),
      scope: 'single_request',
      title: request.name,
      totalEndpoints: 1,
      endpoints: [endpointJson],
    };

    return {
      json: exportData,
      markdownPrompt: this.buildMarkdownPrompt(exportData),
      typeScriptTypes: endpointJson.typeScriptTypes,
    };
  }

  /**
   * Export Sub-Collection / Folder Endpoints
   * @param {string} collectionId 
   * @param {string} folderId 
   * @param {string} userId 
   */
  static async exportFolder(collectionId, folderId, userId) {
    const { collection } = await this.verifyAccess(collectionId, userId);
    const folder = collection.folders.find((f) => f._id.toString() === folderId.toString());
    const folderName = folder ? folder.name : 'Sub-collection Folder';

    const requests = await RequestRepository.findByFolderId(folderId);

    const endpoints = await Promise.all(
      requests.map(async (req) => {
        const examples = await ResponseExampleRepository.findByRequestId(req._id);
        return this.buildCleanRequestJson(req, examples);
      })
    );

    const exportData = {
      reqkitVersion: '1.0',
      exportedAt: new Date().toISOString(),
      scope: 'sub_collection',
      title: `${collection.name} -> ${folderName}`,
      totalEndpoints: endpoints.length,
      endpoints,
    };

    const typeScriptTypes = endpoints.map((e) => e.typeScriptTypes).join('\n\n');

    return {
      json: exportData,
      markdownPrompt: this.buildMarkdownPrompt(exportData),
      typeScriptTypes,
    };
  }

  /**
   * Export Complete Collection
   * @param {string} collectionId 
   * @param {string} userId 
   */
  static async exportCollection(collectionId, userId) {
    const { collection } = await this.verifyAccess(collectionId, userId);
    const requests = await RequestRepository.findByCollectionId(collectionId);

    const endpoints = await Promise.all(
      requests.map(async (req) => {
        const examples = await ResponseExampleRepository.findByRequestId(req._id);
        return this.buildCleanRequestJson(req, examples);
      })
    );

    const exportData = {
      reqkitVersion: '1.0',
      exportedAt: new Date().toISOString(),
      scope: 'collection',
      title: collection.name,
      description: collection.description || '',
      variables: collection.variables || [],
      totalEndpoints: endpoints.length,
      endpoints,
    };

    const typeScriptTypes = endpoints.map((e) => e.typeScriptTypes).join('\n\n');

    return {
      json: exportData,
      markdownPrompt: this.buildMarkdownPrompt(exportData),
      typeScriptTypes,
    };
  }
}
