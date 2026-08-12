import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL;
if (rawApiUrl && rawApiUrl.includes('mini-erp.onrender.com') && !rawApiUrl.includes('mini-erp-zrna.onrender.com')) {
  rawApiUrl = rawApiUrl.replace('mini-erp.onrender.com', 'mini-erp-zrna.onrender.com');
}

const API_BASE_URL =
  rawApiUrl ||
  (import.meta.env.DEV ? '/api/v1' : 'https://mini-erp-zrna.onrender.com/api/v1');

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization JWT token automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 token expiration responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
