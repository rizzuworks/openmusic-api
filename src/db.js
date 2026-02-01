const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool(connectionString ? { connectionString } : {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

module.exports = pool;
