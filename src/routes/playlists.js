const express = require('express');
const playlistsHandler = require('../handlers/playlistsHandler');

const router = express.Router();

router.post('/', playlistsHandler.addPlaylistHandler);
router.get('/', playlistsHandler.getPlaylistsHandler);
router.post('/:playlistId/songs', playlistsHandler.addSongToPlaylistHandler);
router.get('/:id/songs', playlistsHandler.getSongsInPlaylistHandler);
router.delete('/:playlistId/songs', playlistsHandler.removeSongFromPlaylistHandler);
router.delete('/:id', playlistsHandler.deletePlaylistHandler);
router.get('/:playlistId/activities', playlistsHandler.getActivitiesHandler);

module.exports = router;
