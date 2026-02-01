require('dotenv').config();
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const albumsRoutes = require('./routes/albums');
const songsRoutes = require('./routes/songs');
const usersRoutes = require('./routes/users');
const authenticationsRoutes = require('./routes/authentications');
const playlistsRoutes = require('./routes/playlists');
const collaborationsRoutes = require('./routes/collaborations');
const exportsRoutes = require('./routes/exports');
const ClientError = require('./exceptions/ClientError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const AuthorizationError = require('./exceptions/AuthorizationError');
const NotFoundError = require('./exceptions/NotFoundError');
const InternalServerError = require('./exceptions/InternalServerError');

const app = express();

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/albums', albumsRoutes);
app.use('/songs', songsRoutes);
app.use('/users', usersRoutes);
app.use('/authentications', authenticationsRoutes);

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

app.use('/playlists', authenticateToken, playlistsRoutes);
app.use('/collaborations', authenticateToken, collaborationsRoutes);
app.use('/export', authenticateToken, exportsRoutes);

app.use((req, res, next) => {
  next(new NotFoundError());
});

app.use((err, req, res, next) => {
  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err && err.isJoi) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }

  console.error(err);
  if (err instanceof InternalServerError) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
  return res.status(500).json({
    status: 'error',
    message: new InternalServerError().message,
  });
});

const { HOST } = process.env;
const { PORT } = process.env;

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
