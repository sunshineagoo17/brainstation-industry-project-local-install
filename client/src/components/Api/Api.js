import axios from 'axios';

const api = axios.create({
  baseURL: 'https://spectra-de1476b6df25.herokuapp.com',
});

export default api;