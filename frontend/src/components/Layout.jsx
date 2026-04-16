import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]';

function navLinkClass(isActive) {
  return isActive
    ? `${navLinkBase} bg-[#1F2937] font-semibold text-white`
    : `${navLinkBase} text-[#9CA3AF] hover:bg-white/5 hover:text-white`;
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

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
    <div className="flex min-h-screen flex-col bg-[#020617] font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-[#1F2937] bg-[#020617]/95 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            onClick={closeMobile}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-bold tracking-tight text-white shadow-[0_0_22px_rgba(59,130,246,0.55)]"
              aria-hidden
            >
              SC
            </span>
            <span className="text-lg font-bold tracking-tight text-[#3B82F6]">
              Smart Campus
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Main navigation"
          >
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              About us
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Contact
            </NavLink>
            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Profile
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/bookings/my"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Bookings
              </NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Admin
              </NavLink>
            )}
            {/* Add more links as needed */}
          </nav>

          <div className="flex items-center gap-2">
            {/* Notification bell — only shown when logged in */}
            <NotificationPanel />

            {/* Auth buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 md:flex">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6]/20 text-xs font-semibold text-[#3B82F6]">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="max-w-[120px] truncate text-sm font-medium text-[#CBD5E1]">
                        {user.name}
                      </span>
                    </div>
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="rounded-lg border border-[#334155] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-[#94A3B8] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    id="login-btn"
                    to="/login"
                    className="rounded-lg bg-[#3B82F6] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(59,130,246,0.35)] transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)]"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="rounded-lg p-2 text-[#9CA3AF] hover:bg-white/5 hover:text-white md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenuAlt3 className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-[#1F2937] bg-[#020617] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                Home
              </NavLink>
              <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                About us
              </NavLink>
              <NavLink to="/contact" onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                Contact
              </NavLink>
              {user && (
                <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                  Profile
                </NavLink>
              )}
              {user && (
                <NavLink to="/bookings/my" onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                  Bookings
                </NavLink>
              )}
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin/users" onClick={closeMobile} className={({ isActive }) => navLinkClass(isActive)}>
                  Admin
                </NavLink>
              )}
            </div>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
