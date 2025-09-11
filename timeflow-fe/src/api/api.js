import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const postData = async (endpoint, data) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

export const getData = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

export const putData = async (endpoint, data) => {
  const response = await api.put(endpoint, data);
  return response.data;
};

export const deleteData = async (endpoint) => {
  const response = await api.delete(endpoint);
  return response.data;
};

export default api;