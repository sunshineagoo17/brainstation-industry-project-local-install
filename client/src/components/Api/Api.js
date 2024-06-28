// server/api.js
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.heroku.com',
  headers: {
    'Authorization': `Bearer ${process.env.HEROKU_API_KEY}`,
    'Accept': 'application/vnd.heroku+json; version=3'
  }
});

module.exports = api;