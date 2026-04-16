import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMyBookings,
  cancelBooking,
  rescheduleBooking,
  deleteBooking,
} from '../../services/bookingService';
import { getResources } from '../../services/resourceService';

const statusBadge = {
  PENDING:   'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
  APPROVED:  'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]',
  REJECTED:  'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]',
  CANCELLED: 'border-[#6B7280]/30 bg-[#6B7280]/10 text-[#6B7280]',
};

/**
 * MODULE B: My Bookings Page
 * Displays the logged-in user's bookings with status and cancel option
 */
export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  // Redirect admins to admin panel
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/bookings/admin', { replace: true });
    }
  }, [user?.role, navigate]);

  const load = useCallback(async () => {
    if (!user?.id) {
      setError('Please sign in to view your bookings.');
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        getMyBookings(user.id),
        getResources(),
      ]);
      setBookings(bookingsRes.data);
      setResources(resourcesRes.data);
      setError('');
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const openReschedule = (booking) => {
    setRescheduleTarget(booking);
    setRescheduleForm({
      resourceId: String(booking.resourceId ?? ''),
      bookingDate: booking.bookingDate ?? '',
      startTime: booking.startTime?.slice(0, 5) ?? '',
      endTime: booking.endTime?.slice(0, 5) ?? '',
      purpose: booking.purpose ?? '',
      expectedAttendees:
        booking.expectedAttendees === null || booking.expectedAttendees === undefined
          ? ''
          : String(booking.expectedAttendees),
    });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    try {
      await rescheduleBooking(rescheduleTarget.id, {
        resourceId: rescheduleForm.resourceId,
        bookingDate: rescheduleForm.bookingDate,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        purpose: rescheduleForm.purpose,
        expectedAttendees: rescheduleForm.expectedAttendees
          ? Number(rescheduleForm.expectedAttendees)
          : null,
      });
      setRescheduleTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule booking');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cancelled booking permanently?')) return;
    try {
      await deleteBooking(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const getResourceLabel = (resourceId) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return 'Unknown Resource';
    return `${resource.name} - ${resource.location}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#94A3B8]">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
          Module B
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          My Bookings
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          View and manage your resource booking requests.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/bookings"
            className="rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-[#3B82F6]/40 hover:text-white"
          >
            New Booking
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-5 py-4 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Reschedule Booking
            </h3>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Only pending bookings can be rescheduled.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <select
                value={rescheduleForm.resourceId}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, resourceId: e.target.value }))
                }
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
                required
              >
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={rescheduleForm.bookingDate}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, bookingDate: e.target.value }))
                }
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
                required
              />
              <input
                type="time"
                value={rescheduleForm.startTime}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
                required
              />
              <input
                type="time"
                value={rescheduleForm.endTime}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
                required
              />
              <input
                type="number"
                min="0"
                value={rescheduleForm.expectedAttendees}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, expectedAttendees: e.target.value }))
                }
                placeholder="Expected attendees"
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
              />
              <input
                type="text"
                value={rescheduleForm.purpose}
                onChange={(e) =>
                  setRescheduleForm((prev) => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="Purpose"
                className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
              />

              <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="rounded-lg border border-[#1F2937] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-6 py-16 text-center shadow-lg shadow-black/25">
          <p className="text-[#94A3B8]">You have no bookings yet.</p>
          <Link
            to="/bookings"
            className="mt-4 inline-block rounded-xl bg-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
            Create a Booking
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-lg shadow-black/25 transition-all hover:border-[#3B82F6]/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {getResourceLabel(b.resourceId)}
                  </p>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    {b.bookingDate} &middot; {b.startTime} – {b.endTime}
                  </p>
                  {b.purpose && (
                    <p className="mt-2 text-sm text-[#CBD5E1]">{b.purpose}</p>
                  )}
                  {b.expectedAttendees && (
                    <p className="mt-1 text-xs text-[#64748B]">
                      Attendees: {b.expectedAttendees}
                    </p>
                  )}
                  {b.adminComment && (
                    <p className="mt-2 text-sm italic text-[#EF4444]">
                      Reason: {b.adminComment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge[b.status] || ''}`}
                  >
                    {b.status}
                  </span>
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => openReschedule(b)}
                      className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/20"
                    >
                      Reschedule
                    </button>
                  )}
                  {b.status === 'APPROVED' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/20"
                    >
                      Cancel
                    </button>
                  )}
                  {(b.status === 'CANCELLED' || b.status === 'REJECTED') && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
