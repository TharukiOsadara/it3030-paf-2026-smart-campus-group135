import { useState, useEffect, useRef } from "react";

const THEMES = [
  { 
    id: "dark", 
    name: "Dark Mode", 
    icon: "🌙", 
    description: "Balanced - Easy on the eyes",
    primary: "#0A84FF"
  },
  { 
    id: "night", 
    name: "Night Mode", 
    icon: "🌃", 
    description: "Deepest - Maximum contrast",
    primary: "#0A84FF"
  },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = THEMES.find(t => t.id === currentTheme);

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <span className="theme-switcher__trigger-icon">{current?.icon}</span>
        <span className="theme-switcher__trigger-text">{current?.name}</span>
        <svg 
          className={`theme-switcher__chevron ${isOpen ? "theme-switcher__chevron--open" : ""}`}
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="theme-switcher__dropdown animate-scaleIn">
          <div className="theme-switcher__header">
            <span className="theme-switcher__header-icon">🎨</span>
            <span>Display Theme</span>
          </div>
          
          <div className="theme-switcher__options">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? "theme-option--active" : ""}`}
                onClick={() => {
                  setCurrentTheme(theme.id);
                  setIsOpen(false);
                }}
              >
                <div className="theme-option__preview">
                  <div className="theme-option__preview-primary" style={{ background: theme.primary }} />
                  <div className="theme-option__preview-surface" />
                  <div className="theme-option__preview-text" />
                </div>
                <div className="theme-option__info">
                  <div className="theme-option__header">
                    <span className="theme-option__icon">{theme.icon}</span>
                    <span className="theme-option__name">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <svg className="theme-option__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <p className="theme-option__description">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="theme-switcher__footer">
            <div className="theme-switcher__footer-preview">
              <div className="preview-dot" style={{ background: "var(--color-primary)" }} />
              <div className="preview-dot" style={{ background: "var(--color-accent)" }} />
              <div className="preview-dot" style={{ background: "var(--color-warn)" }} />
              <div className="preview-dot" style={{ background: "var(--color-danger)" }} />
            </div>
            <span className="theme-switcher__footer-text">Changes apply instantly</span>
          </div>
        </div>
      )}
    </div>
  );
}
