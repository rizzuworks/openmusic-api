const express = require('express');

const router = express.Router();
const songsHandler = require('../handlers/songsHandler');

router.post('/', songsHandler.addSongHandler);
router.get('/', songsHandler.getSongsHandler);
router.get('/:id', songsHandler.getSongByIdHandler);
router.put('/:id', songsHandler.editSongByIdHandler);
router.delete('/:id', songsHandler.deleteSongByIdHandler);

module.exports = router;
