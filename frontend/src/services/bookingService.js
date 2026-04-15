// MODULE B: Booking Service - API client for booking management
import axios from "axios";

const API_URL = "http://localhost:8080/api/bookings";

/**
 * Create a new booking request
 * @param {Object} booking - { resourceId, bookingDate, startTime, endTime, purpose, expectedAttendees }
 * @param {number} userId - ID of the user creating the booking
 */
export const createBooking = (booking, userId) =>
  axios.post(`${API_URL}?userId=${userId}`, booking);

/**
 * Get all bookings for a specific user
 * @param {number} userId
 */
export const getMyBookings = (userId) =>
  axios.get(`${API_URL}/my?userId=${userId}`);

/**
 * Get all bookings (admin view)
 */
export const getAllBookings = () => axios.get(API_URL);

/**
 * Approve a pending booking
 * @param {number} id - booking ID
 */
export const approveBooking = (id) => axios.put(`${API_URL}/${id}/approve`);

/**
 * Reject a pending booking with a reason
 * @param {number} id - booking ID
 * @param {string} reason - rejection reason
 */
export const rejectBooking = (id, reason) =>
  axios.put(`${API_URL}/${id}/reject`, { reason });

/**
 * Cancel an approved booking
 * @param {number} id - booking ID
 */
export const cancelBooking = (id) => axios.put(`${API_URL}/${id}/cancel`);

/**
 * Reschedule a pending booking
 * @param {number} id - booking ID
 * @param {Object} booking - { resourceId, bookingDate, startTime, endTime, purpose, expectedAttendees }
 */
export const rescheduleBooking = (id, booking) =>
  axios.put(`${API_URL}/${id}/reschedule`, booking);

/**
 * Delete a cancelled booking
 * @param {number} id - booking ID
 */
export const deleteBooking = (id) => axios.delete(`${API_URL}/${id}`);
