const UsersService = require('../services/UsersService');
const { userSchema } = require('../validators/userValidator');
const ClientError = require('../exceptions/ClientError');

const service = new UsersService();

const addUserHandler = async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) throw new ClientError(error.message, 400);

    try {
      const userId = await service.addUser(value);
      return res.status(201).json({
        status: 'success',
        data: { userId },
      });
    } catch (err) {
      if (err.message && err.message.includes('exists')) {
        throw new ClientError('Username already exists', 400);
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = { addUserHandler };
