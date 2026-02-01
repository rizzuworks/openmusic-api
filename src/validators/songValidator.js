const Joi = require('joi');

const songSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().optional(),
});

module.exports = { songSchema };
