const CollaborationsService = require('../services/CollaborationsService');
const PlaylistsService = require('../services/PlaylistsService');
const UsersService = require('../services/UsersService');
const { collaborationSchema } = require('../validators/collaborationValidator');
const ClientError = require('../exceptions/ClientError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const AuthorizationError = require('../exceptions/AuthorizationError');

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService();
const usersService = new UsersService();

const addCollaborationHandler = async (req, res, next) => {
  try {
    const { error, value } = collaborationSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { playlistId, userId } = value;
    const playlist = await playlistsService.getPlaylistById(playlistId);
    if (!playlist) throw new ClientError('Playlist not found', 404);

    const ownerId = req.auth && req.auth.userId;
    if (!ownerId) throw new AuthenticationError('Missing authentication');

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, ownerId);
    if (!isOwner) throw new AuthorizationError('Only owner can add collaborators');

    const user = await usersService.getUserById(userId);
    if (!user) throw new ClientError('User not found', 404);

    const collabId = await collaborationsService.addCollaboration(playlistId, userId);
    return res.status(201).json({
      status: 'success',
      data: { collaborationId: collabId },
    });
  } catch (err) {
    return next(err);
  }
};

const deleteCollaborationHandler = async (req, res, next) => {
  try {
    const { error, value } = collaborationSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { playlistId, userId } = value;
    const playlist = await playlistsService.getPlaylistById(playlistId);
    if (!playlist) throw new ClientError('Playlist not found', 404);

    const ownerId = req.auth && req.auth.userId;
    if (!ownerId) throw new AuthenticationError('Missing authentication');

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, ownerId);
    if (!isOwner) throw new AuthorizationError('Only owner can remove collaborators');

    const user = await usersService.getUserById(userId);
    if (!user) throw new ClientError('User not found', 404);

    const ok = await collaborationsService.deleteCollaboration(playlistId, userId);
    if (!ok) throw new ClientError('Collaboration not found', 404);

    return res.json({
      status: 'success',
      message: 'Collaborator removed',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addCollaborationHandler,
  deleteCollaborationHandler,
};
