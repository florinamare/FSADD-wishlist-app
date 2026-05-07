const Joi = require('joi');

const register = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    'string.min': 'Username must be at least 3 characters.',
    'string.max': 'Username cannot exceed 50 characters.',
    'any.required': 'Username is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters.',
    'any.required': 'Password is required.',
  }),
});

const login = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
});

module.exports = { register, login };
