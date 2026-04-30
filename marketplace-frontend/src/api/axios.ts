import axios from 'axios';

// Get the base API URL from environment variables or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Derived static URL (removing /api suffix and adding /static)
export const STATIC_URL = API_BASE_URL.replace(/\/api\/?$/, '') + '/static';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
