import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const transactionAPI = {
  create: (transactionData) => api.post('/transactions', transactionData),
  getAll: (params) => api.get('/transactions', { params }),
  update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  getById: (id) => api.get(`/transactions/${id}`),
};

export const uploadAPI = {
  uploadReceipt: (formData) => {
    return api.post('/uploads/receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadBankStatement: (formData) => {
    return api.post('/uploads/bank-statement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default api;
