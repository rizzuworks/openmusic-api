const jwt = require('jsonwebtoken');
const UsersService = require('../services/UsersService');
const AuthenticationsService = require('../services/AuthenticationsService');
const { authSchema, refreshSchema } = require('../validators/authenticationValidator');
const ClientError = require('../exceptions/ClientError');
const AuthenticationError = require('../exceptions/AuthenticationError');

const usersService = new UsersService();
const authService = new AuthenticationsService();

const postAuthHandler = async (req, res, next) => {
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { username, password } = value;
    const userId = await usersService.verifyUserCredential(username, password);
    if (!userId) throw new AuthenticationError('Invalid credentials');

    const accessKey = process.env.ACCESS_TOKEN_KEY || 'access_key_default';
    const refreshKey = process.env.REFRESH_TOKEN_KEY || 'refresh_key_default';

    const accessToken = jwt.sign({ userId }, accessKey);
    const refreshToken = jwt.sign({ userId }, refreshKey);

    await authService.addRefreshToken(refreshToken);

    return res.status(201).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const putAuthHandler = async (req, res, next) => {
  try {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { refreshToken } = value;
    const refreshKey = process.env.REFRESH_TOKEN_KEY || 'refresh_key_default';
    const payload = authService.verifyTokenSignature(refreshToken, refreshKey);
    if (!payload) throw new ClientError('Invalid refresh token', 400);

    const exists = await authService.verifyRefreshToken(refreshToken);
    if (!exists) throw new ClientError('Refresh token not found', 400);

    const accessKey = process.env.ACCESS_TOKEN_KEY || 'access_key_default';
    const accessToken = jwt.sign({ userId: payload.userId }, accessKey);
    return res.json({
      status: 'success',
      data: { accessToken },
    });
  } catch (err) {
    return next(err);
  }
};

const deleteAuthHandler = async (req, res, next) => {
  try {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    const { refreshToken } = value;
    const payload = authService.verifyTokenSignature(refreshToken, process.env.REFRESH_TOKEN_KEY);

    if (!payload) {
      const exists = await authService.verifyRefreshToken(refreshToken);
      if (!exists) throw new ClientError('Invalid refresh token', 400);
    }

    const ok = await authService.deleteRefreshToken(refreshToken);
    if (!ok) throw new ClientError('Refresh token not found', 400);

    return res.json({
      status: 'success',
      message: 'Refresh token deleted',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  postAuthHandler,
  putAuthHandler,
  deleteAuthHandler,
};
