import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Workspace Input Validation Class using Joi
 */
export class WorkspaceValidation {
  /**
   * Validates Create Workspace Payload
   * @param {Object} data 
   */
  static validateCreateWorkspace(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Workspace name cannot be empty',
        'string.min': 'Workspace name must be at least 2 characters',
        'any.required': 'Workspace name is required',
      }),
      description: Joi.string().trim().allow('').max(500),
      isPersonal: Joi.boolean().default(false),
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
   * Validates Update Workspace Payload
   * @param {Object} data 
   */
  static validateUpdateWorkspace(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(2).max(100).messages({
        'string.min': 'Workspace name must be at least 2 characters',
      }),
      description: Joi.string().trim().allow('').max(500),
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
   * Validates Add Team Member Payload
   * @param {Object} data 
   */
  static validateAddMember(data) {
    const schema = Joi.object({
      email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid member email address',
        'any.required': 'Member email is required',
      }),
      role: Joi.string().valid('editor', 'viewer').default('editor'),
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
   * Validates Update Member Role Payload
   * @param {Object} data 
   */
  static validateUpdateMemberRole(data) {
    const schema = Joi.object({
      role: Joi.string().valid('owner', 'editor', 'viewer').required().messages({
        'any.only': 'Role must be owner, editor, or viewer',
        'any.required': 'Member role is required',
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
}
