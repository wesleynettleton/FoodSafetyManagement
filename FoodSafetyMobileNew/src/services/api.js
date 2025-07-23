import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PRODUCTION ONLY - NO LOCAL CONNECTIONS ALLOWED
const API_BASE_URL = 'https://foodsafetymanagement.onrender.com/api';

// Create axios instance with ONLY production URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 second timeout for production
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request to:', API_BASE_URL + config.url);
    return config;
  } catch (error) {
    console.error('Error adding token to request:', error);
    return config;
  }
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response from:', API_BASE_URL);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/user')
};

export default api; 