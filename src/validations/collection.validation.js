import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

const variableSchema = Joi.object({
  key: Joi.string().trim().required().messages({
    'any.required': 'Variable key is required',
  }),
  value: Joi.string().allow('').default(''),
  enabled: Joi.boolean().default(true),
});

/**
 * Collection Input Validation Class using Joi
 */
export class CollectionValidation {
  /**
   * Validates Create Collection Payload
   * @param {Object} data 
   */
  static validateCreateCollection(data) {
    const schema = Joi.object({
      workspaceId: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid workspace ID format',
        'any.required': 'Workspace ID is required',
      }),
      name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Collection name cannot be empty',
        'string.min': 'Collection name must be at least 2 characters',
        'any.required': 'Collection name is required',
      }),
      description: Joi.string().trim().allow('').max(500),
      variables: Joi.array().items(variableSchema).default([]),
    });

    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      throw new ApiError(400, 'Validation Error', details);
    }
    return value;
  }

  /**
   * Validates Update Collection Payload
   * @param {Object} data 
   */
  static validateUpdateCollection(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(2).max(100).messages({
        'string.min': 'Collection name must be at least 2 characters',
      }),
      description: Joi.string().trim().allow('').max(500),
      variables: Joi.array().items(variableSchema),
    });

    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      throw new ApiError(400, 'Validation Error', details);
    }
    return value;
  }

  /**
   * Validates Create Folder Payload
   * @param {Object} data 
   */
  static validateCreateFolder(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Folder name cannot be empty',
        'any.required': 'Folder name is required',
      }),
      description: Joi.string().trim().allow('').max(500),
      parentId: Joi.string().hex().length(24).allow(null).default(null),
    });

    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      throw new ApiError(400, 'Validation Error', details);
    }
    return value;
  }

  /**
   * Validates Update Folder Payload
   * @param {Object} data 
   */
  static validateUpdateFolder(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(1).max(100).messages({
        'string.empty': 'Folder name cannot be empty',
      }),
      description: Joi.string().trim().allow('').max(500),
      parentId: Joi.string().hex().length(24).allow(null),
    });

    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      throw new ApiError(400, 'Validation Error', details);
    }
    return value;
  }
}
