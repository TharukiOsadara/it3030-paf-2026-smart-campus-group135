import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineXMark, HiOutlineUser, HiOutlineCog, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const navLinkBase = 'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200';

function navLinkClass(isActive) {
  return isActive
    ? `${navLinkBase} bg-[#3B82F6]/20 text-[#3B82F6]`
    : `${navLinkBase} text-[#9CA3AF] hover:bg-white/5 hover:text-white`;
}

/**
 * Admin sidebar layout component.
 */
export function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#1F2937] bg-[#111827] transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9CA3AF] hover:bg-white/5 lg:hidden"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            <NavLink
              to="/admin/users"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={onClose}
            >
              <HiOutlineCog className="h-5 w-5" />
              <span>User Management</span>
            </NavLink>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={onClose}
            >
              <HiOutlineUser className="h-5 w-5" />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#1F2937] px-4 py-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * Technician sidebar layout component.
 */
export function TechnicianSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#1F2937] bg-[#111827] transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Technician Portal</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9CA3AF] hover:bg-white/5 lg:hidden"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            <NavLink
              to="/technician-dashboard"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={onClose}
            >
              <HiOutlineCog className="h-5 w-5" />
              <span>Tasks & Tickets</span>
            </NavLink>
            <NavLink
              to="/technician-profile"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={onClose}
            >
              <HiOutlineUser className="h-5 w-5" />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#1F2937] px-4 py-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}