import api from './authService';

/**
 * Get all notifications for the current user.
 */
export const getMyNotifications = async () => {
  const response = await api.get('/api/notifications');
  return response.data;
};

/**
 * Get unread notification count.
 */
export const getUnreadCount = async () => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data.count;
};

/**
 * Create a new notification.
 */
export const createNotification = async (data) => {
  const response = await api.post('/api/notifications', data);
  return response.data;
};

/**
 * Mark a notification as read.
 */
export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/api/notifications/${id}/read`);
  return response.data;
};
