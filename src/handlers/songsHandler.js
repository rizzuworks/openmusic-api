const SongsService = require('../services/SongsService');
const { songSchema } = require('../validators/songValidator');
const ClientError = require('../exceptions/ClientError');

const service = new SongsService();

const addSongHandler = async (req, res, next) => {
  try {
    const { error, value } = songSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const songId = await service.addSong(value);
    return res.status(201).json({
      status: 'success',
      data: { songId },
    });
  } catch (err) {
    return next(err);
  }
};

const getSongsHandler = async (req, res, next) => {
  try {
    const { title, performer } = req.query;
    const songs = await service.getSongs({ title, performer });
    return res.json({
      status: 'success',
      data: { songs },
    });
  } catch (err) {
    return next(err);
  }
};

const getSongByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await service.getSongById(id);
    if (!song) throw new ClientError('Song not found', 404);

    return res.json({
      status: 'success',
      data: { song },
    });
  } catch (err) {
    return next(err);
  }
};

const editSongByIdHandler = async (req, res, next) => {
  try {
    const { error, value } = songSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { id } = req.params;
    const ok = await service.editSongById(id, value);
    if (!ok) throw new ClientError('Song not found', 404);

    return res.json({
      status: 'success',
      message: 'Song updated',
    });
  } catch (err) {
    return next(err);
  }
};

const deleteSongByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ok = await service.deleteSongById(id);
    if (!ok) throw new ClientError('Song not found', 404);

    return res.json({
      status: 'success',
      message: 'Song deleted',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addSongHandler,
  getSongsHandler,
  getSongByIdHandler,
  editSongByIdHandler,
  deleteSongByIdHandler,
};
