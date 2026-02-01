const express = require('express');
const { postExportPlaylistHandler } = require('../handlers/exportsHandler');

const router = express.Router();

router.post('/playlists/:playlistId', postExportPlaylistHandler);

module.exports = router;
