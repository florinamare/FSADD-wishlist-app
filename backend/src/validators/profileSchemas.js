const Joi = require('joi');

const updateUsername = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    'string.min': 'Username must be at least 3 characters.',
    'string.max': 'Username cannot exceed 50 characters.',
    'any.required': 'Username is required.',
  }),
});

const updatePassword = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Old password is required.',
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'New password must be at least 6 characters.',
    'any.required': 'New password is required.',
  }),
});

module.exports = { updateUsername, updatePassword };
