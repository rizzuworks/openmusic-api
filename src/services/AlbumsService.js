const { nanoid } = require('nanoid');
const pool = require('../db');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const res = await pool.query(query);
    return res.rows[0].id;
  }

  async getAlbums() {
    const res = await pool.query('SELECT id, name, year FROM albums');
    return res.rows;
  }

  async getAlbumById(id) {
    const res = await pool.query('SELECT id, name, year, cover_url as "coverUrl" FROM albums WHERE id = $1', [id]);
    return res.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const res = await pool.query(
      'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      [name, year, id],
    );
    return res.rowCount > 0;
  }

  async updateAlbumCover(id, coverUrl) {
    const res = await pool.query(
      'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      [coverUrl, id],
    );
    return res.rowCount > 0;
  }

  async deleteAlbumById(id) {
    const res = await pool.query('DELETE FROM albums WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  async getSongsByAlbumId(albumId) {
    const res = await pool.query('SELECT id, title, performer FROM songs WHERE album_id = $1', [albumId]);
    return res.rows;
  }

  async likeAlbum(albumId, userId) {
    const checkRes = await pool.query(
      'SELECT id FROM album_likes WHERE album_id = $1 AND user_id = $2',
      [albumId, userId],
    );

    if (checkRes.rowCount > 0) {
      throw new Error('Album already liked');
    }

    const id = `album-like-${nanoid(16)}`;
    const res = await pool.query(
      'INSERT INTO album_likes(id, album_id, user_id) VALUES($1, $2, $3) RETURNING id',
      [id, albumId, userId],
    );
    return res.rows[0].id;
  }

  async unlikeAlbum(albumId, userId) {
    const res = await pool.query(
      'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2',
      [albumId, userId],
    );
    return res.rowCount > 0;
  }

  async getAlbumLikesCount(albumId) {
    const res = await pool.query(
      'SELECT COUNT(*)::int as likes FROM album_likes WHERE album_id = $1',
      [albumId],
    );
    return res.rows[0].likes;
  }
}

module.exports = AlbumsService;
