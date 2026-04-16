import { useEffect, useState } from "react";

/* ─────────────────────────────────────────
   PageShell – Full-screen animated loader
   shown during route transitions or data loading
───────────────────────────────────────── */
export default function LoaderPage({ loading = true, message = "Loading..." }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "Initializing systems...",
    "Authenticating session...",
    "Loading campus data...",
    "Almost ready...",
  ];

  useEffect(() => {
    if (!loading) return;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 95) { p = 95; clearInterval(interval); }
      setProgress(Math.min(p, 95));
      setPhase(Math.floor((p / 100) * phases.length));
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="page-shell">
      <div className="shell-orb shell-orb--1" />
      <div className="shell-orb shell-orb--2" />
      <div className="shell-orb shell-orb--3" />

      <div className="shell-content">
        <div className="shell-logo-tile">
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 8L6.2 11.8L14 15.6L21.8 11.8L14 8Z" stroke="white" strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M9.3 13.9V17C9.3 18 11.4 19.2 14 19.2C16.6 19.2 18.7 18 18.7 17V13.9" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21.8 11.9V16.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </div>

        <div className="shell-brand">
          <span className="shell-brand__main">Smart</span><span className="shell-brand__accent">Campus</span>
        </div>
        <p className="shell-brand__sub">{message || "Loading your campus hub..."}</p>

        <div className="shell-progress">
          <div className="shell-progress__track">
            <div
              className="shell-progress__fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="shell-progress__glow"
              style={{ left: `${progress}%` }}
            />
          </div>
          <span className="shell-progress__pct">{Math.round(progress)}%</span>
        </div>

        <p className="shell-status">
          <span className="shell-status__dot" />
          {message || phases[Math.min(phase, phases.length - 1)]}
        </p>

        <div className="shell-dots">
          {[0,1,2,3,4].map(i => (
            <span key={i} className="shell-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   InlineLoader – Smaller inline spinner
───────────────────────────────────────── */
export function InlineLoader({ size = 32, color = "var(--color-primary)" }) {
  return (
    <div className="inline-loader" style={{ width: size, height: size }}>
      <svg viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="20" stroke={color} strokeOpacity="0.15" strokeWidth="4" />
        <path
          d="M25 5 A20 20 0 0 1 45 25"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          className="inline-loader__arc"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────
   SkeletonCard – Skeleton loading card
───────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--header" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--short" />
      <div className="skeleton skeleton--line skeleton--medium" />
      <div className="skeleton skeleton--btn" />
    </div>
  );
}
