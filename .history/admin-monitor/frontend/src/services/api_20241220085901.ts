import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8877';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export default api; 