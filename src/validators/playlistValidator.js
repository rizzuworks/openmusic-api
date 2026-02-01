const Joi = require('joi');

const playlistSchema = Joi.object({
  name: Joi.string().required(),
});

const playlistSongSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { playlistSchema, playlistSongSchema };
