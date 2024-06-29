require('dotenv').config();
const url = require('url');

// Parse the JAWSDB_MARIA_URL
const dbUrl = process.env.JAWSDB_MARIA_URL ? url.parse(process.env.JAWSDB_MARIA_URL) : null;
const [user, password] = dbUrl ? dbUrl.auth.split(':') : [null, null];
const dbName = dbUrl ? dbUrl.path.substring(1) : null;
const dbHost = dbUrl ? dbUrl.hostname : null;
const dbPort = dbUrl ? dbUrl.port : null;

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: dbHost,
      user: user,
      password: password,
      database: dbName,
      port: dbPort,
      charset: 'utf8'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};