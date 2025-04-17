import axios from 'axios';

// Create axios instance with default settings
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token in requests
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // You can dispatch an action to update auth state or redirect
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Books API
const booksAPI = {
  getAll: (params) => api.get('/api/books', { params }),
  getById: (id) => api.get(`/api/books/${id}`),
  search: (query) => api.get(`/api/books/search?query=${query}`),
  create: (bookData) => api.post('/api/books', bookData),
  update: (id, bookData) => api.put(`/api/books/${id}`, bookData),
  delete: (id) => api.delete(`/api/books/${id}`),
  addReview: (id, reviewData) => api.post(`/api/books/${id}/reviews`, reviewData),
  getPopular: () => api.get('/api/books/popular')
};

// Users API
const usersAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  getWishlist: () => api.get('/api/users/wishlist'),
  addToWishlist: (bookId) => api.post(`/api/users/wishlist/${bookId}`),
  removeFromWishlist: (bookId) => api.delete(`/api/users/wishlist/${bookId}`),
  getAll: () => api.get('/api/users'),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role })
};

// Loans API
const loansAPI = {
  getAll: (params) => api.get('/api/loans', { params }),
  getById: (id) => api.get(`/api/loans/${id}`),
  getUserLoans: (status) => api.get(`/api/loans/myloans${status ? `?status=${status}` : ''}`),
  create: (loanData) => api.post('/api/loans', loanData),
  returnBook: (id) => api.put(`/api/loans/${id}/return`),
  renewLoan: (id) => api.put(`/api/loans/${id}/renew`)
};

// Admin API
const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getReports: (reportType) => api.get(`/api/admin/reports/${reportType}`)
};

export { booksAPI, usersAPI, loansAPI, adminAPI };
export default api;