const { nanoid } = require('nanoid');
const pool = require('../db');

class SongsService {
  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs(id, title, year, genre, performer, duration, album_id)
             VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      values: [id, title, year, genre, performer, duration || null, albumId || null],
    };
    const res = await pool.query(query);
    return res.rows[0].id;
  }

  async getSongs({ title, performer } = {}) {
    let base = 'SELECT id, title, performer FROM songs';
    const where = [];
    const values = [];
    if (title) {
      values.push(`%${title}%`);
      where.push(`title ILIKE $${values.length}`);
    }
    if (performer) {
      values.push(`%${performer}%`);
      where.push(`performer ILIKE $${values.length}`);
    }
    if (where.length) {
      base += ` WHERE ${where.join(' AND ')}`;
    }
    const res = await pool.query(base, values);
    return res.rows;
  }

  async getSongById(id) {
    const res = await pool.query(
      'SELECT id, title, year, performer, genre, duration, album_id as "albumId" FROM songs WHERE id = $1',
      [id],
    );
    return res.rows[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const res = await pool.query(
      'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6 WHERE id=$7',
      [title, year, genre, performer, duration || null, albumId || null, id],
    );
    return res.rowCount > 0;
  }

  async deleteSongById(id) {
    const res = await pool.query('DELETE FROM songs WHERE id = $1', [id]);
    return res.rowCount > 0;
  }
}

module.exports = SongsService;
