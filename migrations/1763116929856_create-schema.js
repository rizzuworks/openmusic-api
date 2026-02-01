exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'text', notNull: true, primaryKey: true },
    username: { type: 'text', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    fullname: { type: 'text', notNull: true },
  });

  pgm.createTable('albums', {
    id: { type: 'text', notNull: true, primaryKey: true },
    name: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
  });

  pgm.createTable('songs', {
    id: { type: 'text', notNull: true, primaryKey: true },
    title: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
    genre: { type: 'text', notNull: true },
    performer: { type: 'text', notNull: true },
    duration: { type: 'integer' },
    album_id: { type: 'text', references: 'albums', onDelete: 'SET NULL' },
  });

  pgm.createTable('authentications', {
    id: { type: 'text', notNull: true, primaryKey: true },
    token: { type: 'text', notNull: true, unique: true },
  });

  pgm.createTable('playlists', {
    id: { type: 'text', notNull: true, primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: {
      type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE',
    },
  });

  pgm.createTable('playlist_songs', {
    id: { type: 'text', notNull: true, primaryKey: true },
    playlist_id: {
      type: 'text', notNull: true, references: 'playlists', onDelete: 'CASCADE',
    },
    song_id: {
      type: 'text', notNull: true, references: 'songs', onDelete: 'CASCADE',
    },
  });

  pgm.createTable('collaborations', {
    id: { type: 'text', notNull: true, primaryKey: true },
    playlist_id: {
      type: 'text', notNull: true, references: 'playlists', onDelete: 'CASCADE',
    },
    user_id: {
      type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE',
    },
  });

  pgm.createTable('playlist_activities', {
    id: { type: 'text', notNull: true, primaryKey: true },
    playlist_id: {
      type: 'text', notNull: true, references: 'playlists', onDelete: 'CASCADE',
    },
    song_id: {
      type: 'text', notNull: true, references: 'songs', onDelete: 'CASCADE',
    },
    user_id: {
      type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE',
    },
    action: { type: 'text', notNull: true },
    time: { type: 'timestamp with time zone', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
  pgm.dropTable('authentications');
  pgm.dropTable('songs');
  pgm.dropTable('albums');
  pgm.dropTable('users');
};
