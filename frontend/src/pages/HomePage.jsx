import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

const STATS = [
  { value: "1,240+", label: "Resources Managed" },
  { value: "98.4%",  label: "Uptime SLA" },
  { value: "3,800+", label: "Bookings Processed" },
  { value: "<2 min", label: "Avg. Response Time" },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    color: "var(--color-primary)",
    title: "Facilities Catalogue",
    desc: "Browse and manage all campus resources — lecture halls, labs, meeting rooms, and equipment — with real-time availability.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: "var(--color-accent)",
    title: "Smart Bookings",
    desc: "Request, approve, and manage facility bookings with automatic conflict detection and instant notifications.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    color: "var(--color-danger)",
    title: "Incident Ticketing",
    desc: "Report faults, attach evidence photos, and track resolution — from OPEN to CLOSED — with full technician updates.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    color: "var(--color-warn)",
    title: "Live Notifications",
    desc: "Stay updated with real-time alerts for booking decisions, ticket progress, and new comments via WebSocket.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: "var(--color-info)",
    title: "Role-Based Security",
    desc: "OAuth 2.0 Google sign-in with granular role management — USER, TECHNICIAN, and ADMIN — protecting every endpoint.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    color: "var(--page-dashboard-accent)",
    title: "Analytics Dashboard",
    desc: "Visualize resource utilization, peak booking hours, and incident trends with an admin-level insight dashboard.",
  },
];

const TICKET_WORKFLOW = [
  { label: "OPEN",        color: "var(--status-open)",        icon: "⚡" },
  { label: "IN PROGRESS", color: "var(--status-in-progress)", icon: "🔧" },
  { label: "RESOLVED",    color: "var(--status-resolved)",    icon: "✓" },
  { label: "CLOSED",      color: "var(--status-closed)",      icon: "🔒" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [count, setCount] = useState({ r: 0, b: 0, t: 0 });

  // Parallax mouse effect
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Counting animation for stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setCount({ r: 1240, b: 3800, t: 420 });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const gX = (mousePos.x - 0.5) * 30;
  const gY = (mousePos.y - 0.5) * 20;

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        {/* Ambient background */}
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" style={{ transform: `translate(${gX * 0.5}px, ${gY * 0.5}px)` }} />
          <div className="hero__orb hero__orb--2" style={{ transform: `translate(${-gX * 0.3}px, ${-gY * 0.3}px)` }} />
          <div className="hero__grid" />
        </div>

        <div className="hero__content">
          {/* Eyebrow */}
          <div className="hero__eyebrow animate-fadeInUp">
            <span className="hero__eyebrow-dot" />
            <span>SLIIT · Smart Campus Operations Hub</span>
          </div>

          {/* Headline */}
          <h1 className="hero__headline animate-fadeInUp delay-100">
            One Platform.<br />
            <span className="hero__headline-grad">Every Campus</span><br />
            Operation.
          </h1>

          {/* Subtext */}
          <p className="hero__sub animate-fadeInUp delay-200">
            Unified booking management, incident ticketing, and real-time notifications —
            built with Spring Boot + React for the modern university.
          </p>

          {/* CTA */}
          <div className="hero__ctas animate-fadeInUp delay-300">
            <button className="btn btn-gradient btn-lg" onClick={() => navigate("/dashboard")}>
              Open Dashboard
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/tickets/new")}>
              Report an Incident
            </button>
          </div>

          {/* Stats row */}
          <div className="hero__stats animate-fadeInUp delay-400">
            {STATS.map((s, i) => (
              <div key={i} className="hero__stat">
                <span className="hero__stat-val">{s.value}</span>
                <span className="hero__stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating card preview */}
        <div className="hero__card-wrap animate-fadeInUp delay-300"
          style={{ transform: `perspective(1000px) rotateY(${-gX * 0.3}deg) rotateX(${gY * 0.2}deg)` }}>
          <div className="hero__card">
            <div className="hero__card-header">
              <span className="badge badge-open">● OPEN</span>
              <span className="hero__card-id">#TK-042</span>
            </div>
            <div className="hero__card-title">Projector malfunction in Lab A-302</div>
            <div className="hero__card-meta">
              <span>🏢 Block A, Room 302</span>
              <span>🔴 HIGH Priority</span>
            </div>
            <div className="hero__card-attachments">
              <div className="hero__card-img" style={{background:"rgba(10,132,255,0.15)"}} />
              <div className="hero__card-img" style={{background:"rgba(0,229,195,0.15)"}} />
              <div className="hero__card-img" style={{background:"rgba(255,159,10,0.15)"}} />
              <span className="hero__card-img-more">+2</span>
            </div>
            <div className="hero__card-footer">
              <div className="hero__card-assignee">
                <div className="hero__card-avatar">T</div>
                <span>Technician: Ashan R.</span>
              </div>
              <button className="btn btn-primary btn-sm">View</button>
            </div>
            <div className="hero__card-progress">
              <div className="hero__card-progress-fill" />
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW STRIP ── */}
      <section className="workflow-strip">
        <div className="workflow-strip__inner">
          <p className="workflow-strip__label">Ticket Workflow</p>
          <div className="workflow-strip__steps">
            {TICKET_WORKFLOW.map((step, i) => (
              <div key={i} className="workflow-step">
                <div className="workflow-step__dot" style={{ background: step.color, boxShadow: `0 0 12px ${step.color}` }}>
                  {step.icon}
                </div>
                <span className="workflow-step__label" style={{ color: step.color }}>{step.label}</span>
                {i < TICKET_WORKFLOW.length - 1 && (
                  <div className="workflow-step__arrow">
                    <svg width="24" height="12" fill="none">
                      <path d="M0 6h20M14 1l6 5-6 5" stroke="var(--border-default)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features section">
        <div className="features__header">
          <p className="features__eyebrow">Platform Modules</p>
          <h2 className="section-title">Everything you need,<br /><span style={{color:"var(--color-primary)"}}>built for campus life.</span></h2>
          <p className="section-subtitle features__sub">
            From reporting a damaged projector to booking a lecture hall, every operation
            is managed through one cohesive, role-aware platform.
          </p>
        </div>

        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card animate-fadeInUp delay-${(i % 3) * 100 + 100}`}
              style={{ "--feature-color": f.color }}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <div className="feature-card__line" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="home-cta">
        <div className="home-cta__inner">
          <div className="home-cta__text">
            <h2 className="home-cta__title">Ready to streamline<br />your campus operations?</h2>
            <p className="home-cta__sub">Get started in seconds — sign in with your university Google account.</p>
          </div>
          <div className="home-cta__actions">
            <button className="btn btn-gradient btn-lg" onClick={() => navigate("/login")}>
              Sign In with Google
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </button>
            <Link to="/about" className="btn btn-ghost btn-lg">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
}