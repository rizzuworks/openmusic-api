const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const pool = require('../db');

class AuthenticationsService {
  async addRefreshToken(token) {
    const id = `auth-${nanoid(16)}`;
    await pool.query('INSERT INTO authentications(id, token) VALUES($1,$2)', [id, token]);
    return id;
  }

  async verifyRefreshToken(token) {
    const res = await pool.query('SELECT id FROM authentications WHERE token = $1', [token]);
    return res.rowCount > 0;
  }

  async deleteRefreshToken(token) {
    const res = await pool.query('DELETE FROM authentications WHERE token = $1', [token]);
    return res.rowCount > 0;
  }

  verifyTokenSignature(token, key) {
    try {
      const payload = jwt.verify(token, key);
      return payload;
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthenticationsService;
