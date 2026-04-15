import { useEffect, useRef } from "react";
import "./AboutPage.css";

const TEAM = [
  { name: "Ashan Perera",    role: "Facilities & Assets Module",     avatar: "A", color: "#0A84FF",  modules: ["Resources API", "Catalogue UI"] },
  { name: "Dilmi Rathnayake",role: "Booking Management Module",      avatar: "D", color: "#00E5C3",  modules: ["Booking API", "Conflict Engine"] },
  { name: "Kasun Fernando",  role: "Incident Tickets & Technicians", avatar: "K", color: "#FF3B30",  modules: ["Tickets API", "Attachments", "Comments"] },
  { name: "Nimesha Silva",   role: "Notifications & OAuth",          avatar: "N", color: "#FF9F0A",  modules: ["WebSocket", "Google OAuth", "Roles"] },
];

const TECH_STACK = [
  { name: "Spring Boot 3",      category: "Backend",  color: "#6DB33F", desc: "REST API with layered architecture" },
  { name: "React 18 + Vite",    category: "Frontend", color: "#61DAFB", desc: "SPA with hooks and React Router" },
  { name: "MongoDB Atlas",      category: "Database", color: "#47A248", desc: "Document store for all collections" },
  { name: "Spring Security",    category: "Security", color: "#0A84FF", desc: "OAuth2 + JWT + RBAC" },
  { name: "WebSocket / STOMP",  category: "Realtime", color: "#FF9F0A", desc: "Live notification delivery" },
  { name: "GitHub Actions",     category: "CI/CD",    color: "#2088FF", desc: "Automated build & test pipeline" },
  { name: "Lombok + MapStruct", category: "Tools",    color: "#BC4520", desc: "Reduced boilerplate, DTO mapping" },
  { name: "JUnit 5 + Mockito",  category: "Testing",  color: "#25A162", desc: "Unit & integration tests" },
];

const MODULES = [
  { letter: "A", title: "Facilities & Assets",      desc: "Catalogue of bookable resources with search & filtering.",         color: "var(--color-primary)" },
  { letter: "B", title: "Booking Management",        desc: "PENDING → APPROVED/REJECTED workflow with conflict detection.",    color: "var(--color-accent)" },
  { letter: "C", title: "Incident Ticketing",        desc: "OPEN → IN_PROGRESS → RESOLVED → CLOSED with attachments.",        color: "var(--color-danger)" },
  { letter: "D", title: "Notifications",             desc: "Real-time alerts for every key workflow event.",                   color: "var(--color-warn)" },
  { letter: "E", title: "Auth & Authorization",      desc: "Google OAuth 2.0 + role-based access control.",                   color: "var(--color-info)" },
];

export default function AboutPage() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle("in-view", e.isIntersecting)),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="about-page page-wrapper">
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <div className="about-orb about-orb--1" />
          <div className="about-orb about-orb--2" />
        </div>
        <div className="about-hero__content">
          <p className="about-hero__eyebrow animate-fadeInUp">IT3030 · PAF Assignment 2026 · SLIIT</p>
          <h1 className="about-hero__headline animate-fadeInUp delay-100">
            Smart Campus<br />
            <span className="about-hero__accent">Operations Hub</span>
          </h1>
          <p className="about-hero__sub animate-fadeInUp delay-200">
            A production-grade university management platform developed as a group coursework project
            for the Programming Applications and Frameworks (IT3030) module at SLIIT.
          </p>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="section about-modules">
        <div className="about-section-header">
          <p className="about-eyebrow" style={{color:"var(--color-accent)"}}>Core Modules</p>
          <h2 className="section-title">Five modules,<br /><span style={{color:"var(--color-accent)"}}>one platform.</span></h2>
        </div>
        <div className="about-modules__grid">
          {MODULES.map((m, i) => (
            <div
              key={i}
              className="module-card reveal-card"
              ref={el => cardsRef.current[i] = el}
              style={{ "--m-color": m.color, animationDelay: `${i * 0.1}s` }}
            >
              <div className="module-card__letter">{m.letter}</div>
              <div>
                <h3 className="module-card__title">{m.title}</h3>
                <p className="module-card__desc">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="section about-team">
        <div className="about-section-header">
          <p className="about-eyebrow" style={{color:"var(--color-primary)"}}>The Team</p>
          <h2 className="section-title">Built by<br /><span style={{color:"var(--color-primary)"}}>four engineers.</span></h2>
        </div>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div
              key={i}
              className="team-card reveal-card"
              ref={el => cardsRef.current[MODULES.length + i] = el}
              style={{ "--t-color": m.color, animationDelay: `${i * 0.12}s` }}
            >
              <div className="team-card__avatar" style={{ background: m.color }}>
                {m.avatar}
              </div>
              <h3 className="team-card__name">{m.name}</h3>
              <p className="team-card__role">{m.role}</p>
              <div className="team-card__tags">
                {m.modules.map((mod, j) => (
                  <span key={j} className="team-card__tag">{mod}</span>
                ))}
              </div>
              <div className="team-card__glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="section about-stack">
        <div className="about-section-header">
          <p className="about-eyebrow" style={{color:"var(--color-warn)"}}>Technology Stack</p>
          <h2 className="section-title">Modern tools.<br /><span style={{color:"var(--color-warn)"}}>Production quality.</span></h2>
        </div>
        <div className="stack-grid">
          {TECH_STACK.map((t, i) => (
            <div key={i} className="stack-card reveal-card"
              ref={el => cardsRef.current[MODULES.length + TEAM.length + i] = el}
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stack-card__dot" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
              <div>
                <div className="stack-card__name">{t.name}</div>
                <div className="stack-card__category" style={{ color: t.color }}>{t.category}</div>
                <div className="stack-card__desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ASSIGNMENT INFO ── */}
      <section className="section about-info">
        <div className="about-info__card">
          <h2 className="about-info__title">Assignment Details</h2>
          <div className="about-info__grid">
            {[
              ["Module",     "IT3030 – Programming Applications & Frameworks"],
              ["Institution","Faculty of Computing, SLIIT"],
              ["Weight",     "30% of Final Mark"],
              ["Released",   "24 March 2026"],
              ["Viva",       "Starting 11 April 2026"],
              ["Deadline",   "27 April 2026 – 11:45 PM (GMT +5:30)"],
              ["Stack",      "Spring Boot REST API + React Client"],
              ["Database",   "MongoDB Atlas"],
            ].map(([k, v], i) => (
              <div key={i} className="about-info__row">
                <span className="about-info__key">{k}</span>
                <span className="about-info__val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}