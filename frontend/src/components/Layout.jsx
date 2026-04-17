import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { path: "/",          label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/about",     label: "About" },
  { path: "/contact",   label: "Contact Us" },
];

export default function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
