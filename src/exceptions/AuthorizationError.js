const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
