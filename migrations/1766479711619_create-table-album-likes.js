/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add unique constraint to prevent duplicate likes
  pgm.addConstraint('album_likes', 'unique_album_user_like', {
    unique: ['album_id', 'user_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('album_likes');
};
