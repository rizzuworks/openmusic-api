const Joi = require('joi');

const collaborationSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { collaborationSchema };
