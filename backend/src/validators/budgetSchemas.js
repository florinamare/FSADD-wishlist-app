const Joi = require('joi');

const adjust = Joi.object({
  type: Joi.string().valid('add', 'subtract').required().messages({
    'any.only': 'Type must be "add" or "subtract".',
    'any.required': 'Type is required.',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number.',
    'any.required': 'Amount is required.',
  }),
  note: Joi.string().trim().max(200).allow('', null).default(''),
});

module.exports = { adjust };
