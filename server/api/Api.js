const axios = require('axios');

const api = axios.create({
  baseURL: process.env.BASE_URL || 'https://dell-technologies-spectra-8b1af00a7312.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = api;