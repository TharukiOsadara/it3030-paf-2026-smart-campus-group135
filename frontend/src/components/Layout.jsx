import { useState, useEffect, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/Layout.css";

const NAV_LINKS = [
  { path: "/",          label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/tickets",   label: "My Tickets" },
  { path: "/about",     label: "About" },
  { path: "/contact",   label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Mock notifications – replace with real data from API
  const notifications = [
    { id: 1, message: "Ticket #TK-005 status changed to IN_PROGRESS", time: "2m ago", unread: true },
    { id: 2, message: "Your ticket #TK-003 has been RESOLVED",         time: "1h ago", unread: true },
    { id: 3, message: "New comment added to ticket #TK-002",           time: "3h ago", unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="layout">
      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logoGradTop)" />
                <path d="M14 8L6.2 11.8L14 15.6L21.8 11.8L14 8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9.3 13.9V17C9.3 18 11.4 19.2 14 19.2C16.6 19.2 18.7 18 18.7 17V13.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21.8 11.9V16.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logoGradTop" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5A84F6" />
                    <stop offset="1" stopColor="#9B75EE" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="navbar__logo-text">Smart<span className="navbar__logo-accent">Campus</span></span>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar__links">
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`navbar__link ${isActive(path) ? "navbar__link--active" : ""}`}
                >
                  {label}
                  {isActive(path) && <span className="navbar__link-dot" />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="navbar__actions">
            <ThemeSwitcher />
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="navbar__icon-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-panel animate-scaleIn">
                  <div className="notif-panel__header">
                    <span>Notifications</span>
                    <span className="notif-panel__count">{unreadCount} new</span>
                  </div>
                  <div className="notif-panel__list">
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.unread ? "notif-item--unread" : ""}`}>
                        {n.unread && <span className="notif-item__dot" />}
                        <div>
                          <p className="notif-item__msg">{n.message}</p>
                          <p className="notif-item__time">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-panel__footer">
                    <button className="btn btn-ghost btn-sm" onClick={() => setNotifOpen(false)}>
                      Mark all read
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-gradient btn-sm" onClick={() => navigate("/tickets/new")}>+ Report Issue</button>
            <Link to="/login" className="navbar__avatar" title="My Account">
              <span>U</span>
            </Link>
            <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar__mobile ${menuOpen ? "navbar__mobile--open" : ""}`}>
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__mobile-link ${isActive(path) ? "navbar__mobile-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
          <button className="btn btn-gradient" onClick={() => navigate("/tickets/new")}>
            + Report Issue
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="layout__main"><Outlet /></main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="navbar__logo">
              <span className="navbar__logo-icon">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="8" fill="url(#logoGradBottom)" />
                  <path d="M14 8L6.2 11.8L14 15.6L21.8 11.8L14 8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9.3 13.9V17C9.3 18 11.4 19.2 14 19.2C16.6 19.2 18.7 18 18.7 17V13.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21.8 11.9V16.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="logoGradBottom" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5A84F6" />
                      <stop offset="1" stopColor="#9B75EE" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="navbar__logo-text">Smart<span className="navbar__logo-accent">Campus</span></span>
            </Link>
            <p className="footer__tagline">Modernizing university operations, one workflow at a time.</p>
          </div>

          <div className="footer__links">
            <div className="footer__col">
              <h4>Platform</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/tickets">Tickets</Link>
              <Link to="/tickets/new">Report Issue</Link>
            </div>
            <div className="footer__col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer__col">
              <h4>Stack</h4>
              <a href="#" target="_blank" rel="noopener">Spring Boot</a>
              <a href="#" target="_blank" rel="noopener">React + Vite</a>
              <a href="#" target="_blank" rel="noopener">MongoDB</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Smart Campus Operations Hub · IT3030 – PAF · SLIIT</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}