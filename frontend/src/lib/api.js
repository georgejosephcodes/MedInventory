import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/* =========================
   AUTH
========================= */
export const login = (credentials) =>
  api.post('/auth/login', credentials);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
  api.post("/auth/reset-password", {
    token,
    newPassword: password,
  });


/* =========================
   ADMIN — USERS
========================= */
export const adminGetUsers = () =>
  api.get('/admin/users');

export const adminCreateUser = (data) =>
  api.post('/admin/users', data);

export const adminUpdateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const adminDisableUser = (id) =>
  api.patch(`/admin/users/${id}/disable`);

export const adminEnableUser = (id) =>
  api.patch(`/admin/users/${id}/enable`);

/* =========================
   MEDICINES
========================= */
export const getMedicines = (params) =>
  api.get('/medicines', { params });

export const getMedicine = (id) =>
  api.get(`/medicines/${id}`);

export const createMedicine = (data) =>
  api.post('/medicines', data);

export const updateMedicine = (id, data) =>
  api.patch(`/medicines/${id}`, data);

export const deleteMedicine = (id) =>
  api.delete(`/medicines/${id}`);


/* =========================
   BATCHES / INVENTORY
========================= */

// DASHBOARD — all active batches
export const getBatches = () =>
  api.get("/batches");

// INVENTORY — batches for one medicine
export const getBatchesByMedicine = (medicineId) =>
  api.get(`/batches/medicine/${medicineId}`);

export const stockIn = (data) =>
  api.post("/batches/stock-in", data);

export const stockOut = (data) =>
  api.post("/batches/stock-out", data);



/* =========================
   AUDIT
========================= */
export const getStockLogs = (params = {}) =>
  api.get('/audit/stock-logs', { params });

/* =========================
   REPORTS
========================= */
export const getMonthlyUsage = (params) =>
  api.get('/reports/monthly-usage', { params });

export const getTopConsumed = (params) =>
  api.get('/reports/top-consumed', { params });

export const getExpiredWastage = (params) =>
  api.get('/reports/expired-wastage', { params });

/* =========================
   DASHBOARD (OPTIONAL / FUTURE)
========================= */
export const getDashboardData = () =>
  api.get('/dashboard');

export default api;
