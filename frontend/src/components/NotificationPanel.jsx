import { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineBell } from 'react-icons/hi2';
import { getMyNotifications, getUnreadCount, markNotificationAsRead } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

/**
 * Notification bell icon with dropdown panel (Member 4).
 * Shows unread count badge, lists notifications, and allows marking as read.
 */
export default function NotificationPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch all notifications when panel opens
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const typeColors = {
    BOOKING: 'bg-[#3B82F6]/20 text-[#3B82F6]',
    TICKET: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    SYSTEM: 'bg-[#10B981]/20 text-[#10B981]',
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-[#9CA3AF] transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
        aria-label="Notifications"
      >
        <HiOutlineBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl shadow-black/50 sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <HiOutlineBell className="mx-auto h-10 w-10 text-[#334155]" />
                <p className="mt-2 text-sm text-[#64748B]">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-[#1F2937] px-4 py-3 transition-colors last:border-b-0 ${
                      !n.read ? 'bg-[#3B82F6]/[0.04]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              typeColors[n.type] || 'bg-[#334155]/30 text-[#94A3B8]'
                            }`}
                          >
                            {n.type}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="mt-1 shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/20"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}