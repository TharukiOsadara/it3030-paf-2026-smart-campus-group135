import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiCheckCircle, HiExclamationCircle, HiClock } from 'react-icons/hi2';

/**
 * Technician Dashboard — shows maintenance tickets and tasks for technicians.
 * Only accessible to users with TECHNICIAN role.
 */
export default function TechnicianDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not a technician
    if (!loading && user && user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Technician Dashboard
        </h1>
        <p className="mt-2 text-[#94A3B8]">
          Manage and track maintenance tasks and service requests
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pending Tickets */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <HiClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Pending Tasks</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        {/* Completed Tickets */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <HiCheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Completed</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        {/* Critical Issues */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <HiExclamationCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Critical</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets Section */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8">
        <h2 className="mb-6 text-xl font-bold text-white">Recent Maintenance Tickets</h2>
        <div className="space-y-4">
          <p className="text-center text-[#64748B]">
            No maintenance tickets assigned yet.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8">
        <h2 className="mb-6 text-xl font-bold text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-xl bg-[#3B82F6] px-6 py-3 font-semibold text-white hover:bg-blue-500">
            View All Tasks
          </button>
          <button className="rounded-xl border border-[#334155] bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}
