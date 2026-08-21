import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

const keyValuePairSchema = Joi.object({
  key: Joi.string().allow('').default(''),
  value: Joi.string().allow('').default(''),
  enabled: Joi.boolean().default(true),
});

const pathParamSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().allow('').default(''),
  description: Joi.string().allow('').default(''),
});

/**
 * Request & Live Runner Input Validation Class using Joi
 */
export class RequestValidation {
  /**
   * Validates Create Request Payload
   * @param {Object} data 
   */
  static validateCreateRequest(data) {
    const schema = Joi.object({
      collectionId: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid collection ID format',
        'any.required': 'Collection ID is required',
      }),
      folderId: Joi.string().hex().length(24).allow(null).default(null),
      name: Joi.string().trim().min(1).max(150).required().messages({
        'string.empty': 'Request name cannot be empty',
        'any.required': 'Request name is required',
      }),
      description: Joi.string().trim().allow('').max(1000),
      method: Joi.string()
        .valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')
        .default('GET'),
      url: Joi.string().trim().required().messages({
        'string.empty': 'Request URL cannot be empty',
        'any.required': 'Request URL is required',
      }),
      headers: Joi.array().items(keyValuePairSchema).default([]),
      queryParams: Joi.array().items(keyValuePairSchema).default([]),
      pathParams: Joi.array().items(pathParamSchema).default([]),
      auth: Joi.object({
        type: Joi.string().valid('none', 'bearer', 'basic', 'apikey', 'inherit').default('inherit'),
        config: Joi.object().default({}),
      }).default(),
      body: Joi.object({
        type: Joi.string().valid('none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw').default('none'),
        rawContent: Joi.string().allow('').default(''),
        formData: Joi.array().items(keyValuePairSchema).default([]),
      }).default(),
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
   * Validates Update Request Payload
   * @param {Object} data 
   */
  static validateUpdateRequest(data) {
    const schema = Joi.object({
      folderId: Joi.string().hex().length(24).allow(null),
      name: Joi.string().trim().min(1).max(150),
      description: Joi.string().trim().allow('').max(1000),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'),
      url: Joi.string().trim(),
      headers: Joi.array().items(keyValuePairSchema),
      queryParams: Joi.array().items(keyValuePairSchema),
      pathParams: Joi.array().items(pathParamSchema),
      auth: Joi.object({
        type: Joi.string().valid('none', 'bearer', 'basic', 'apikey', 'inherit'),
        config: Joi.object(),
      }),
      body: Joi.object({
        type: Joi.string().valid('none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'),
        rawContent: Joi.string().allow(''),
        formData: Joi.array().items(keyValuePairSchema),
      }),
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
   * Validates Execute Request (Live Runner) Payload
   * @param {Object} data 
   */
  static validateExecuteRequest(data) {
    const schema = Joi.object({
      method: Joi.string()
        .valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')
        .required(),
      url: Joi.string().trim().required().messages({
        'any.required': 'Execution target URL is required',
      }),
      headers: Joi.array().items(keyValuePairSchema).default([]),
      queryParams: Joi.array().items(keyValuePairSchema).default([]),
      auth: Joi.object({
        type: Joi.string().valid('none', 'bearer', 'basic', 'apikey', 'inherit').default('none'),
        config: Joi.object().default({}),
      }).default(),
      body: Joi.object({
        type: Joi.string().valid('none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw').default('none'),
        rawContent: Joi.string().allow('').default(''),
        formData: Joi.array().items(keyValuePairSchema).default([]),
      }).default(),
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
   * Validates Save Response Example Payload
   * @param {Object} data 
   */
  static validateSaveExample(data) {
    const schema = Joi.object({
      title: Joi.string().trim().min(1).max(100).required().messages({
        'any.required': 'Response example title is required',
      }),
      type: Joi.string().valid('success', 'error').required().messages({
        'any.required': 'Response type (success or error) is required',
      }),
      statusCode: Joi.number().integer().min(100).max(599).required(),
      statusText: Joi.string().allow('').default(''),
      headers: Joi.object().default({}),
      body: Joi.any().default(null),
      responseTimeMs: Joi.number().min(0).default(0),
      sizeBytes: Joi.number().min(0).default(0),
      isDefault: Joi.boolean().default(false),
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
