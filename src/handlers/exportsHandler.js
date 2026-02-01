const ExportsService = require('../services/ExportsService');
const PlaylistsService = require('../services/PlaylistsService');
const { ExportPlaylistPayloadSchema } = require('../validators/exportValidator');
const AuthorizationError = require('../exceptions/AuthorizationError');
const NotFoundError = require('../exceptions/NotFoundError');

const exportsService = new ExportsService();
const playlistsService = new PlaylistsService();

const postExportPlaylistHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { error, value } = ExportPlaylistPayloadSchema.validate(req.body);
    if (error) throw error;

    const { targetEmail } = value;
    const { userId } = req.auth;

    const playlist = await playlistsService.getPlaylistById(playlistId);
    if (!playlist) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, userId);
    if (!isOwner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    await exportsService.sendMessage(playlistId, targetEmail);

    res.status(201).json({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { postExportPlaylistHandler };
