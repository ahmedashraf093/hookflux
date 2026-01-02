import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (username, password) => api.post('/login', { username, password }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const fluxes = {
  getAll: () => api.get('/fluxes'),
  getStatuses: () => api.get('/fluxes/statuses'),
  create: (data) => api.post('/fluxes', data),
  update: (id, data) => api.put(`/fluxes/${id}`, data),
  delete: (id) => api.delete(`/fluxes/${id}`),
  deploy: (id) => api.post(`/fluxes/${id}/deploy`),
  getDeployments: (id) => api.get(`/fluxes/${id}/deployments`),
  testSsh: (data) => api.post('/fluxes/test-ssh', data),
};

export const modules = {
  getAll: () => api.get('/modules'),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

export const system = {
  getPublicKey: () => api.get('/system/public-key'),
  getAuditLogs: () => api.get('/system/audit'),
  getHealth: () => api.get('/health'),
  getVersion: () => api.get('/system/version'),
};

export const deployments = {
  getLogs: (id) => api.get(`/deployments/${id}`),
};

export default api;
