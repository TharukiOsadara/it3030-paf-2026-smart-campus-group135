import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Facility Catalogue",
    desc: "Browse and manage bookable resources across campus",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Smart Booking",
    desc: "Request and manage facility bookings with conflict detection",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Incident Tickets",
    desc: "Report and track maintenance issues with image evidence",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Notifications",
    desc: "Stay updated on bookings, tickets, and comments in real-time",
  },
];

const STATS = [
  { value: "500+", label: "Resources" },
  { value: "10K+", label: "Bookings" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page page-wrapper">
      <section className="home-hero">
        <div className="home-hero__ambient" />
        <div className="home-hero__content">
          <div className="home-hero__badge">Trusted by universities worldwide</div>

          <h1 className="home-hero__title">
            Smart Campus
            <span>Operations Hub</span>
          </h1>

          <p className="home-hero__subtitle">
            Streamline facility bookings, maintenance tracking, and campus operations
            all in one modern platform.
          </p>

          <div className="home-hero__actions">
            <button className="btn btn-gradient btn-lg" onClick={() => navigate("/dashboard")}>Start Now</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/about")}>Learn More</button>
          </div>

          <div className="home-hero__stats">
            {STATS.map((s) => (
              <div key={s.label} className="home-stat">
                <div className="home-stat__value">{s.value}</div>
                <div className="home-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-features section">
        <div className="home-features__header">
          <h2>Everything You Need</h2>
          <p>Manage your entire campus operations from a single, intuitive platform.</p>
        </div>

        <div className="home-features__grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="home-feature-card">
              <div className="home-feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta-band">
        <div className="home-cta__inner">
          <h2>Ready to modernize your campus?</h2>
          <p>Join hundreds of universities already using SmartCampus to streamline operations.</p>
          <button className="btn btn-gradient btn-lg" onClick={() => navigate("/dashboard")}>Get Started Free</button>
        </div>
      </section>
    </div>
  );
}
