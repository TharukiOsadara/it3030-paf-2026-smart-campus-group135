import api from './authService';

/**
 * Get all users (ADMIN only).
 */
export const getAllUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

/**
 * Get a single user by ID.
 */
export const getUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

/**
 * Update a user's profile.
 */
export const updateUser = async (id, data) => {
  const response = await api.put(`/api/users/${id}`, data);
  return response.data;
};

/**
 * Delete a user.
 */
export const deleteUser = async (id) => {
  await api.delete(`/api/users/${id}`);
};

/**
 * Change a user's role.
 */
export const changeUserRole = async (id, role) => {
  const response = await api.patch(`/api/users/${id}/role`, { role });
  return response.data;
};
