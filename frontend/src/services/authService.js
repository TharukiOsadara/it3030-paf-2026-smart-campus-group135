import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send session cookies for both OAuth2 and local auth
});

/**
 * Register a new user with email/password.
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

/**
 * Login with email/password.
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Get the currently authenticated user.
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

/**
 * Logout the current user.
 */
export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

/**
 * Google OAuth2 login URL — redirect the browser here.
 */
export const GOOGLE_LOGIN_URL = `${API_BASE}/oauth2/authorization/google`;

export default api;
