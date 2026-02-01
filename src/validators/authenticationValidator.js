const Joi = require('joi');

const authSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { authSchema, refreshSchema };
