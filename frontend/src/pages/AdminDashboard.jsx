import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser, updateUser, changeUserRole } from '../services/userService';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2';
import {
  isNameValid,
  isRestrictedEmailValid,
  sanitizeEmailInput,
  sanitizeNameInput,
} from '../utils/formValidation';

/**
 * Admin dashboard — user management table with CRUD and role change (Member 4).
 * Only accessible to ADMIN users.
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users. Make sure you have ADMIN access.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setActionLoading(id);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditStart = (u) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email });
  };

  const handleEditSave = async (id) => {
    if (!isNameValid(editForm.name)) {
      alert('Name can only contain letters and spaces');
      return;
    }

    if (!isRestrictedEmailValid(editForm.email)) {
      alert('Email can only contain letters, numbers, @ and .');
      return;
    }

    try {
      setActionLoading(id);
      const updated = await updateUser(id, editForm);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      setActionLoading(id);
      const updated = await changeUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
          <p className="text-lg font-semibold text-red-400">Access Error</p>
          <p className="mt-2 text-sm text-[#94A3B8]">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 border-b border-[#1F2937] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          User Management
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Manage all registered users, change roles, and remove accounts.
        </p>
      </header>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-4">
          <p className="text-2xl font-bold text-[#3B82F6]">{users.length}</p>
          <p className="text-sm text-[#94A3B8]">Total Users</p>
        </div>
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-4">
          <p className="text-2xl font-bold text-[#10B981]">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
          <p className="text-sm text-[#94A3B8]">Admins</p>
        </div>
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-4">
          <p className="text-2xl font-bold text-[#8B5CF6]">
            {users.filter((u) => u.role === 'TECHNICIAN').length}
          </p>
          <p className="text-sm text-[#94A3B8]">Technicians</p>
        </div>
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-4">
          <p className="text-2xl font-bold text-[#F59E0B]">
            {users.filter((u) => u.role === 'USER').length}
          </p>
          <p className="text-sm text-[#94A3B8]">Regular Users</p>
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-lg shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="users-table">
            <thead>
              <tr className="border-b border-[#1F2937] text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors duration-150 hover:bg-[#1a2332]"
                >
                  <td className="px-5 py-4">
                    {editingId === u.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: sanitizeNameInput(e.target.value) })
                        }
                        className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-sm text-white outline-none focus:border-[#3B82F6]"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6]/20 text-sm font-semibold text-[#3B82F6]">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#94A3B8]">
                    {editingId === u.id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: sanitizeEmailInput(e.target.value) })
                        }
                        className="w-full rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-sm text-white outline-none focus:border-[#3B82F6]"
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      id={`role-select-${u.id}`}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={actionLoading === u.id}
                      className="cursor-pointer rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors focus:border-[#3B82F6]"
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-[#94A3B8]">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === u.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(u.id)}
                            disabled={actionLoading === u.id}
                            className="rounded-lg bg-[#10B981]/20 p-2 text-[#10B981] transition-colors hover:bg-[#10B981]/30"
                            title="Save"
                          >
                            <HiOutlineCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg bg-[#64748B]/20 p-2 text-[#94A3B8] transition-colors hover:bg-[#64748B]/30"
                            title="Cancel"
                          >
                            <HiOutlineXMark className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditStart(u)}
                            disabled={actionLoading === u.id}
                            className="rounded-lg bg-[#3B82F6]/20 p-2 text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/30"
                            title="Edit"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-user-${u.id}`}
                            onClick={() => handleDelete(u.id)}
                            disabled={actionLoading === u.id}
                            className="rounded-lg bg-[#EF4444]/20 p-2 text-[#EF4444] transition-colors hover:bg-[#EF4444]/30"
                            title="Delete"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#64748B]">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
