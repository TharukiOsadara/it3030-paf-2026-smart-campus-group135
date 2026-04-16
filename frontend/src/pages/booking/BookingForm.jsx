import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/bookingService';
import { getResources } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';

const defaultForm = {
  resourceId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
};

/**
 * MODULE B: Booking Form Page
 * Allows users to create a new resource booking request
 */
export default function BookingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect admins to admin panel
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/bookings/admin', { replace: true });
    }
  }, [user?.role, navigate]);

  // Fetch available resources for the dropdown
  const loadResources = useCallback(async () => {
    try {
      const res = await getResources();
      setResources(res.data);
    } catch {
      console.error('Failed to load resources');
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!form.resourceId || !form.bookingDate || !form.startTime || !form.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.startTime >= form.endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        setError('Please sign in to create a booking.');
        setLoading(false);
        return;
      }

      const payload = {
        resourceId: form.resourceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
      };
      await createBooking(payload, user.id);
      setSuccess('Booking request submitted successfully!');
      setForm(defaultForm);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create booking. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#475569] outline-none transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]';
  const labelClass = 'mb-1.5 block text-sm font-medium text-[#94A3B8]';

  return (
    <div>
      <header className="mb-10 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
          Module B
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create Booking
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Reserve a campus resource by filling out the form below.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/bookings/my"
            className="rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-[#3B82F6]/40 hover:text-white"
          >
            My Bookings
          </Link>
        </div>
      </header>

      {success && (
        <div className="mb-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-5 py-4 text-sm text-[#10B981]">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-5 py-4 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/25 sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Resource */}
          <div className="sm:col-span-2">
            <label htmlFor="resourceId" className={labelClass}>
              Resource <span className="text-[#EF4444]">*</span>
            </label>
            <select
              id="resourceId"
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select a resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.location} (Capacity: {r.capacity ?? 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="bookingDate" className={labelClass}>
              Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="bookingDate"
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className={labelClass}>
              Start Time <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="startTime"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className={labelClass}>
              End Time <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Expected Attendees */}
          <div>
            <label htmlFor="expectedAttendees" className={labelClass}>
              Expected Attendees
            </label>
            <input
              id="expectedAttendees"
              type="number"
              name="expectedAttendees"
              value={form.expectedAttendees}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 25"
              className={inputClass}
            />
          </div>

          {/* Purpose */}
          <div className="sm:col-span-2">
            <label htmlFor="purpose" className={labelClass}>
              Purpose
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the purpose of this booking..."
              className={inputClass + ' resize-none'}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#3B82F6] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-all hover:bg-[#2563EB] hover:shadow-[#3B82F6]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
