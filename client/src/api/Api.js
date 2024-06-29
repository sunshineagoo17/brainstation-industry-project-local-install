import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'https://spectra-de1476b6df25.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;