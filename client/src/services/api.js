import axios from 'axios';

// Use environment variable or default to '/api' for production
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/user')
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`)
};

// Locations API
export const locationsAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (locationData) => api.post('/locations', locationData),
  update: (id, locationData) => api.put(`/locations/${id}`, locationData),
  delete: (id) => api.delete(`/locations/${id}`)
};

// Records API
export const recordsAPI = {
  // Food Temperature Records
  createFoodTemperature: (data) => api.post('/records/food-temperature', data),
  getFoodTemperatures: () => api.get('/records/food-temperature'),
  updateFoodTemperature: (id, data) => api.put(`/records/food-temperature/${id}`, data),
  getByType: (type) => api.get(`/records/${type}`),
  getRecordsByTypeAndLocation: (type, locationId) => api.get(`/records/admin/${type}/${locationId}`),

  // Probe Calibration Records
  createProbeCalibration: (data) => api.post('/records/probe-calibration', data),
  getProbeCalibrations: () => api.get('/records/probe-calibration'),
  updateProbeCalibration: (id, data) => api.put(`/records/probe-calibration/${id}`, data),

  // Delivery Records
  createDelivery: (data) => api.post('/records/delivery', data),
  getDeliveries: () => api.get('/records/delivery'),
  updateDelivery: (id, data) => api.put(`/records/delivery/${id}`, data),

  // Temperature Records
  createTemperature: (data) => api.post('/records/temperature', {
    temperature: data.temperature,
    equipmentType: data.equipmentType,
    equipmentId: data.equipment,
    note: data.note
  }),
  getTemperatures: () => api.get('/records/temperature?populate=equipment'),
  updateTemperature: (id, data) => api.put(`/records/temperature/${id}`, data),
  deleteTemperatures: () => api.delete('/records/temperature/all'),

  // Cooling Temperature Records
  createCoolingTemperature: (data) => api.post('/records/cooling-temperature', data),
  getCoolingTemperatures: () => api.get('/records/cooling-temperature'),
  updateCoolingTemperature: (id, data) => api.put(`/records/cooling-temperature/${id}`, data),

  // Weekly Records
  createWeeklyRecord: (data) => api.post('/records/weekly-record', data),
  getWeeklyRecords: () => api.get('/records/weekly-record'),

  // Generic record operations
  getAll: () => api.get('/records'),
  getById: (id) => api.get(`/records/${id}`),
  create: (recordData) => api.post('/records', recordData),
  update: (id, recordData) => api.put(`/records/${id}`, recordData),
  delete: (type, id) => api.delete(`/records/${type}/${id}`)
};

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`)
};

export const analyticsAPI = {
  getAnalytics: (location = 'all') => {
    const params = location !== 'all' ? `?location=${location}` : '';
    return api.get(`/analytics${params}`);
  },
  getComplianceReport: (startDate, endDate, location = 'all', reportType = 'full') => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      reportType
    });
    if (location !== 'all') {
      params.append('location', location);
    }
    return api.get(`/analytics/compliance-report?${params}`);
  },
  downloadComplianceReportPDF: (startDate, endDate, location = 'all') => {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    if (location !== 'all') {
      params.append('location', location);
    }
    return api.get(`/analytics/compliance-report/pdf?${params}`, {
      responseType: 'blob'
    });
  },
  getProbeCalibrationStatus: () => api.get('/analytics/probe-calibration-status'),
  getTemperatureReadingStatus: () => api.get('/analytics/temperature-reading-status')
};

export default api;