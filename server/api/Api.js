const axios = require('axios');

const api = axios.create({
    baseURL: process.env.BASE_URL || 'https://spectra-de1476b6df25.herokuapp.com',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
  
  module.exports = api;