const PlaylistsService = require('../services/PlaylistsService');
const SongsService = require('../services/SongsService');
const CollaborationsService = require('../services/CollaborationsService');
const { playlistSchema, playlistSongSchema } = require('../validators/playlistValidator');
const ClientError = require('../exceptions/ClientError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const AuthorizationError = require('../exceptions/AuthorizationError');

const playlistsService = new PlaylistsService();
const songsService = new SongsService();
const collaborationsService = new CollaborationsService();

const addPlaylistHandler = async (req, res, next) => {
  try {
    const { error, value } = playlistSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const owner = req.auth && req.auth.userId;
    if (!owner) throw new AuthenticationError('Missing authentication');

    const playlistId = await playlistsService.addPlaylist({ name: value.name, owner });
    return res.status(201).json({
      status: 'success',
      data: { playlistId },
    });
  } catch (err) {
    return next(err);
  }
};

const getPlaylistsHandler = async (req, res, next) => {
  try {
    const owner = req.auth && req.auth.userId;
    if (!owner) throw new AuthenticationError('Missing authentication');
    const playlists = await playlistsService.getPlaylistsByUser(owner);
    return res.json({
      status: 'success',
      data: { playlists },
    });
  } catch (err) {
    return next(err);
  }
};

const addSongToPlaylistHandler = async (req, res, next) => {
  try {
    const { error, value } = playlistSongSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { playlistId } = req.params;
    const userId = req.auth && req.auth.userId;
    if (!userId) throw new AuthenticationError('Missing authentication');

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, userId);
    const isCollaborator = await collaborationsService.verifyCollaborator(playlistId, userId);
    if (!isOwner && !isCollaborator) throw new AuthorizationError('You do not have access to this resource');

    const song = await songsService.getSongById(value.songId);
    if (!song) throw new ClientError('Song not found', 404);

    await playlistsService.addSongToPlaylist(playlistId, value.songId);
    await playlistsService.addActivity(playlistId, value.songId, userId, 'add');

    return res.status(201).json({
      status: 'success',
      message: 'Song added to playlist',
    });
  } catch (err) {
    return next(err);
  }
};

const getSongsInPlaylistHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth && req.auth.userId;
    if (!userId) throw new AuthenticationError('Missing authentication');

    const playlist = await playlistsService.getPlaylistById(id);
    if (!playlist) throw new ClientError('Playlist not found', 404);

    const isOwner = await playlistsService.verifyPlaylistOwner(id, userId);
    const isCollaborator = await collaborationsService.verifyCollaborator(id, userId);
    if (!isOwner && !isCollaborator) throw new AuthorizationError('You do not have access to this resource');

    const songs = await playlistsService.getSongsInPlaylist(id);
    return res.json({
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

const removeSongFromPlaylistHandler = async (req, res, next) => {
  try {
    const { error, value } = playlistSongSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { playlistId } = req.params;
    const userId = req.auth && req.auth.userId;
    if (!userId) throw new AuthenticationError('Missing authentication');

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, userId);
    const isCollaborator = await collaborationsService.verifyCollaborator(playlistId, userId);
    if (!isOwner && !isCollaborator) throw new AuthorizationError('You do not have access to this resource');

    const ok = await playlistsService.removeSongFromPlaylist(playlistId, value.songId);
    if (!ok) throw new ClientError('Song not found in playlist', 404);

    await playlistsService.addActivity(playlistId, value.songId, userId, 'delete');

    return res.json({
      status: 'success',
      message: 'Song removed from playlist',
    });
  } catch (err) {
    return next(err);
  }
};

const deletePlaylistHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.auth && req.auth.userId;
    if (!userId) throw new AuthenticationError('Missing authentication');

    const isOwner = await playlistsService.verifyPlaylistOwner(id, userId);
    if (!isOwner) throw new AuthorizationError('Only owner can delete playlist');

    const ok = await playlistsService.deletePlaylistById(id);
    if (!ok) throw new ClientError('Playlist not found', 404);

    return res.json({
      status: 'success',
      message: 'Playlist deleted',
    });
  } catch (err) {
    return next(err);
  }
};

const getActivitiesHandler = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.auth && req.auth.userId;
    if (!userId) throw new AuthenticationError('Missing authentication');

    const playlist = await playlistsService.getPlaylistById(playlistId);
    if (!playlist) throw new ClientError('Playlist not found', 404);

    const isOwner = await playlistsService.verifyPlaylistOwner(playlistId, userId);
    const isCollaborator = await collaborationsService.verifyCollaborator(playlistId, userId);
    if (!isOwner && !isCollaborator) throw new AuthorizationError('You do not have access to this resource');

    const rows = await playlistsService.getActivitiesByPlaylistId(playlistId);
    const activities = rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time ? (new Date(row.time)).toISOString() : null,
    }));

    return res.json({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addPlaylistHandler,
  getPlaylistsHandler,
  addSongToPlaylistHandler,
  getSongsInPlaylistHandler,
  removeSongFromPlaylistHandler,
  deletePlaylistHandler,
  getActivitiesHandler,
};
