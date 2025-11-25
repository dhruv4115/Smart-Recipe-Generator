import axios from 'axios';
import { toast } from 'react-hot-toast';

// Store reference will be set after store is created
let logoutCallback: (() => void) | null = null;

export const setAuthLogout = (callback: () => void) => {
  logoutCallback = callback;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const statusCode = error.response?.status;
    
    if (statusCode === 401) {
      // Call logout from store if available
      if (logoutCallback) {
        logoutCallback();
      }
      
      // Redirect to login, preserving current location
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      
      toast.error('Session expired. Please login again.');
    } else if (statusCode === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (statusCode === 500) {
      toast.error(errorData?.message || 'Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (errorData?.message) {
      // Show backend error message if available
      const message = Array.isArray(errorData.message) 
        ? errorData.message.join(', ') 
        : errorData.message;
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
