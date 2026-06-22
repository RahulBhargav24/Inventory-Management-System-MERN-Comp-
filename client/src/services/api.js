import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach JWT token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Categories
export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Suppliers
export const supplierAPI = {
  getAll: (params) => API.get('/suppliers', { params }),
  create: (data) => API.post('/suppliers', data),
  update: (id, data) => API.put(`/suppliers/${id}`, data),
  delete: (id) => API.delete(`/suppliers/${id}`),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  create: (data) => API.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => API.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/products/${id}`),
};

// Orders
export const orderAPI = {
  getAll: (params) => API.get('/orders', { params }),
  create: (data) => API.post('/orders', data),
  update: (id, data) => API.put(`/orders/${id}`, data),
  delete: (id) => API.delete(`/orders/${id}`),
};

// Users
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

// Purchase Orders
export const purchaseOrderAPI = {
  getAll: (params) => API.get('/purchase-orders', { params }),
  create: (data) => API.post('/purchase-orders', data),
  update: (id, data) => API.put(`/purchase-orders/${id}`, data),
  delete: (id) => API.delete(`/purchase-orders/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};
