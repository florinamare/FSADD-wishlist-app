const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Name is required.',
    'string.max': 'Name cannot exceed 100 characters.',
  }),
  description: Joi.string().trim().max(300).allow('', null).default(''),
});

const update = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(300).allow('', null),
}).min(1).messages({
  'object.min': 'At least one field (name or description) must be provided.',
});

module.exports = { create, update };
