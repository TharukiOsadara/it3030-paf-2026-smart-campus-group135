import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
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
 * MODULE B: Admin Bookings Page
 * Displays all bookings with approve / reject actions for admins
 */
export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        getAllBookings(),
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await rejectBooking(rejectId, rejectReason || 'No reason provided');
      setRejectId(null);
      setRejectReason('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking');
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

  const handleReschedule = async (e) => {
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

  const filtered =
    statusFilter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const getResourceLabel = (resourceId) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return 'Unknown Resource';
    return `${resource.name} - ${resource.location}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#94A3B8]">
        Loading bookings...
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
          Module B · Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Manage Bookings
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Review, approve, or reject resource booking requests.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/bookings"
            className="rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-[#3B82F6]/40 hover:text-white"
          >
            New Booking
          </Link>
          <Link
            to="/bookings/my"
            className="rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-[#3B82F6]/40 hover:text-white"
          >
            My Bookings
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-5 py-4 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {/* Status filter */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-[#94A3B8]">Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <span className="ml-auto text-xs text-[#64748B]">
          {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Reject Booking #{rejectId}</h3>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Provide a reason for rejecting this booking:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full resize-none rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#475569] outline-none focus:border-[#3B82F6]"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="rounded-lg border border-[#1F2937] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Reschedule Booking
            </h3>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Only pending bookings can be rescheduled.
            </p>

            <form onSubmit={handleReschedule} className="mt-4 grid gap-4 sm:grid-cols-2">
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

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-6 py-16 text-center shadow-lg shadow-black/25">
          <p className="text-[#94A3B8]">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-lg shadow-black/25 transition-all hover:border-[#3B82F6]/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-white">
                      {getResourceLabel(b.resourceId)}
                    </p>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${statusBadge[b.status] || ''}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    User #{b.userId} &middot; {b.bookingDate} &middot; {b.startTime} – {b.endTime}
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
                      Admin: {b.adminComment}
                    </p>
                  )}
                </div>

                {/* Action buttons (only for PENDING) */}
                {b.status === 'PENDING' && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openReschedule(b)}
                      className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-2 text-xs font-semibold text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/20"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleApprove(b.id)}
                      className="rounded-lg bg-[#10B981] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#059669]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectId(b.id)}
                      className="rounded-lg bg-[#EF4444] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#DC2626]"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {b.status === 'CANCELLED' && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2 text-xs font-semibold text-[#EF4444] transition-colors hover:bg-[#EF4444]/20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
