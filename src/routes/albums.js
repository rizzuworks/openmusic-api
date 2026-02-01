const express = require('express');
const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

const router = express.Router();
const albumsHandler = require('../handlers/albumsHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new AuthenticationError('Missing authentication'));

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return next(new AuthenticationError('Invalid authentication header'));

  const token = parts[1];
  try {
    const accessKey = process.env.ACCESS_TOKEN_KEY || 'access_key_default';
    const payload = jwt.verify(token, accessKey);
    req.auth = { userId: payload.userId };
    return next();
  } catch (err) {
    return next(new AuthenticationError('Invalid access token'));
  }
};

router.post('/', albumsHandler.addAlbumHandler);
router.get('/', albumsHandler.getAlbumsHandler);
router.get('/:id', albumsHandler.getAlbumByIdHandler);
router.put('/:id', albumsHandler.editAlbumByIdHandler);
router.delete('/:id', albumsHandler.deleteAlbumByIdHandler);
router.post('/:id/covers', albumsHandler.uploadAlbumCoverHandler);

router.post('/:id/likes', authenticateToken, albumsHandler.likeAlbumHandler);
router.delete('/:id/likes', authenticateToken, albumsHandler.unlikeAlbumHandler);
router.get('/:id/likes', albumsHandler.getAlbumLikesHandler);

module.exports = router;
