const knex = require('knex');
const config = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';
const connectionConfig = config[environment];

const connection = knex(connectionConfig);

module.exports = connection;