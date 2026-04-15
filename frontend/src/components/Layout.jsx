import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import ThemeSwitcher from "./ThemeSwitcher";

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]';

function navLinkClass(isActive) {
  return isActive
    ? `${navLinkBase} bg-[#1F2937] font-semibold text-white`
    : `${navLinkBase} text-[#9CA3AF] hover:bg-white/5 hover:text-white`;
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-[#1F2937] bg-[#020617]/95 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
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
            {/* Add more links as needed */}
          </nav>
          <div className="navbar__actions flex items-center gap-3">
            <ThemeSwitcher />
            {/* Example notification wrapper, replace with your logic if needed */}
            <div className="notif-wrap">
              {/* ... notifications ... */}
            </div>
            <button className="btn btn-gradient btn-sm" onClick={() => window.location.href = "/tickets/new"}>
              + Report Issue
            </button>
            <Link to="/login" className="navbar__avatar" title="My Account">
              <span>U</span>
            </Link>
            <button className="navbar__hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
