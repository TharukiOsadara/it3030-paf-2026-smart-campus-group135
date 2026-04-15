import { useEffect, useState } from "react";
import "../assets/css/Loader.css";

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
      {/* Background orbs */}
      <div className="shell-orb shell-orb--1" />
      <div className="shell-orb shell-orb--2" />
      <div className="shell-orb shell-orb--3" />

      {/* Grid overlay */}
      <div className="shell-grid" />

      {/* Content */}
      <div className="shell-content">
        {/* Logo animation */}
        <div className="shell-logo">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect width="72" height="72" rx="20" fill="rgba(10,132,255,0.1)" className="shell-logo__bg"/>
            <path
              d="M18 36L36 18L54 36L36 54L18 36Z"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="120"
              strokeDashoffset="120"
              className="shell-logo__path"
            />
            <circle cx="36" cy="36" r="8" fill="none" stroke="var(--color-accent)" strokeWidth="2.5"
              strokeDasharray="50" strokeDashoffset="50"
              className="shell-logo__circle"
            />
            <circle cx="36" cy="36" r="3" fill="var(--color-accent)" className="shell-logo__dot"/>
          </svg>
        </div>

        {/* Brand name */}
        <div className="shell-brand">
          <span className="shell-brand__main">Smart</span>
          <span className="shell-brand__accent">Campus</span>
        </div>
        <p className="shell-brand__sub">Operations Hub</p>

        {/* Progress bar */}
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

        {/* Status message */}
        <p className="shell-status">
          <span className="shell-status__dot" />
          {message || phases[Math.min(phase, phases.length - 1)]}
        </p>

        {/* Scanning dots */}
        <div className="shell-dots">
          {[0,1,2,3,4].map(i => (
            <span key={i} className="shell-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="shell-corner shell-corner--tl" />
      <div className="shell-corner shell-corner--tr" />
      <div className="shell-corner shell-corner--bl" />
      <div className="shell-corner shell-corner--br" />
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