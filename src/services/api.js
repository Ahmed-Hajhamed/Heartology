import axios from 'axios';

// Create the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// THIS PART IS CRITICAL: It injects the token into every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;