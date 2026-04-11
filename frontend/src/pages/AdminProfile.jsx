import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import axios from 'axios';

/**
 * Admin Profile Page — for admin users only.
 */
export default function AdminProfile() {
  const { user, loading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading2, setLoading2] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading2(true);
    try {
      await axios.patch('/api/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }, { withCredentials: true });
      setMessage('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading2(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading2(true);
    try {
      await axios.delete('/api/users/account', { withCredentials: true });
      setMessage('Account deleted. Redirecting...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading2(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <p className="text-red-400">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="max-w-2xl rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div>
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-green-500/20 text-2xl font-bold text-green-400">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-sm text-[#94A3B8]">{user.email}</p>
              </div>
              <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600">
                <HiOutlinePencilSquare className="h-5 w-5" />
              </button>
            </div>

            {/* Profile details */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Role</p>
                <p className="mt-1 text-sm font-medium text-white">
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400">
                    {user.role}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Member Since</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Auth Provider</p>
                <p className="mt-1 text-sm font-medium capitalize text-white">
                  {user.oauthProvider === 'local' ? 'Email' : 'Google'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account settings section */}
      <div className="max-w-2xl rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
        <h3 className="text-base font-bold text-white">Account Settings</h3>
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full rounded-lg border border-[#334155] bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Change Password
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
            <h2 className="text-xl font-bold text-white">Change Password</h2>
            {message && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes('successfully') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <input
                type="password"
                placeholder="Old Password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                className="w-full rounded-lg border border-[#334155] bg-[#1F2937] px-3 py-2 text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full rounded-lg border border-[#334155] bg-[#1F2937] px-3 py-2 text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full rounded-lg border border-[#334155] bg-[#1F2937] px-3 py-2 text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 rounded-lg border border-[#334155] bg-white/5 px-4 py-2 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading2}
                  className="flex-1 rounded-lg bg-[#3B82F6] px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading2 ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-6">
            <h2 className="text-xl font-bold text-red-400">Delete Account</h2>
            {message && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes('successfully') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}
            <p className="mt-4 text-sm text-[#94A3B8]">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-[#334155] bg-white/5 px-4 py-2 text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading2}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                {loading2 ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
