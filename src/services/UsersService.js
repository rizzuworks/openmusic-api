const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('../db');

class UsersService {
  async addUser({ username, password, fullname }) {
    const check = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (check.rowCount > 0) {
      throw new Error('Username already exists');
    }

    const id = `user-${nanoid(16)}`;
    const hashed = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users(id, username, password, fullname) VALUES($1,$2,$3,$4) RETURNING id',
      values: [id, username, hashed, fullname],
    };
    const res = await pool.query(query);
    return res.rows[0].id;
  }

  async verifyUserCredential(username, password) {
    const res = await pool.query('SELECT id, password FROM users WHERE username = $1', [username]);
    if (res.rowCount === 0) return null;

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user.id;
  }

  async getUserById(id) {
    const res = await pool.query('SELECT id, username, fullname FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }
}

module.exports = UsersService;
