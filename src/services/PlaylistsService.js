const { nanoid } = require('nanoid');
const pool = require('../db');

class PlaylistsService {
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    await pool.query('INSERT INTO playlists(id, name, owner) VALUES($1,$2,$3)', [id, name, owner]);
    return id;
  }

  async getPlaylistsByUser(userId) {
    const res = await pool.query(
      `
      SELECT DISTINCT p.id, p.name, u.username
      FROM playlists p
      JOIN users u ON p.owner = u.id
      LEFT JOIN collaborations c ON p.id = c.playlist_id
      WHERE p.owner = $1 OR c.user_id = $1;
      `,
      [userId],
    );
    return res.rows;
  }

  async getPlaylistById(playlistId) {
    const res = await pool.query(
      `
      SELECT p.id, p.name, p.owner, u.username FROM playlists p
      LEFT JOIN users u ON p.owner = u.id
      WHERE p.id = $1
      `,
      [playlistId],
    );
    return res.rows[0];
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const res = await pool.query('SELECT owner FROM playlists WHERE id = $1', [playlistId]);
    if (res.rowCount === 0) return false;
    return res.rows[0].owner === userId;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    await pool.query('INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1,$2,$3)', [id, playlistId, songId]);
    return id;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `playlist-activity-${nanoid(16)}`;
    await pool.query(
      'INSERT INTO playlist_activities(id, playlist_id, song_id, user_id, action) VALUES($1,$2,$3,$4,$5)',
      [id, playlistId, songId, userId, action],
    );
    return id;
  }

  async getSongsInPlaylist(playlistId) {
    const res = await pool.query(
      `
      SELECT s.id, s.title, s.performer FROM songs s
      INNER JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
      `,
      [playlistId],
    );
    return res.rows;
  }

  async getActivitiesByPlaylistId(playlistId) {
    const res = await pool.query(
      `
      SELECT u.username, s.title, pa.action, pa.time
      FROM playlist_activities pa
      JOIN users u ON pa.user_id = u.id
      JOIN songs s ON pa.song_id = s.id
      WHERE pa.playlist_id = $1
      ORDER BY pa.time ASC
      `,
      [playlistId],
    );
    return res.rows;
  }

  async removeSongFromPlaylist(playlistId, songId) {
    const res = await pool.query('DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2', [playlistId, songId]);
    return res.rowCount > 0;
  }

  async isSongInPlaylist(playlistId, songId) {
    const res = await pool.query('SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2', [playlistId, songId]);
    return res.rowCount > 0;
  }

  async deletePlaylistById(playlistId) {
    const res = await pool.query('DELETE FROM playlists WHERE id = $1', [playlistId]);
    return res.rowCount > 0;
  }
}

module.exports = PlaylistsService;
