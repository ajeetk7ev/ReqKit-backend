import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Input Validation Class using Joi
 */
export class AuthValidation {
  /**
   * Validates Registration Payload
   * @param {Object} data 
   */
  static validateRegister(data) {
    const schema = Joi.object({
      name: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Name is required',
      }),
      email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().min(6).max(100).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
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
   * Validates Login Payload
   * @param {Object} data 
   */
  static validateLogin(data) {
    const schema = Joi.object({
      email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required',
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
