const Joi = require('joi');

const breakdownItem = Joi.object({
  key: Joi.string().trim().max(100).required(),
  amount: Joi.number().min(0).required(),
  purchased: Joi.boolean().default(false),
});

const createItem = Joi.object({
  name: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'Name is required.',
    'string.max': 'Name cannot exceed 200 characters.',
  }),
  price: Joi.number().min(0).required().messages({
    'any.required': 'Price is required.',
    'number.min': 'Price cannot be negative.',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  wishlistId: Joi.string().hex().length(24).allow(null, '').default(null),
  breakdown: Joi.array().items(breakdownItem).allow(null).default(null),
});

const updatePurchased = Joi.object({
  purchased: Joi.boolean().required().messages({
    'any.required': 'Field purchased is required.',
  }),
  boughtBy: Joi.string().trim().max(100).allow('', null).default(null),
});

const updateBreakdown = Joi.object({
  purchased: Joi.boolean().required().messages({
    'any.required': 'Field purchased is required.',
  }),
});

module.exports = { createItem, updatePurchased, updateBreakdown };
