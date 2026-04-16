import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import ThemeSwitcher from "./ThemeSwitcher";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`dashboard-shell ${collapsed ? "dashboard-shell--collapsed" : ""} ${mobileOpen ? "dashboard-shell--mobile-open" : ""}`}>
      <AppSidebar
        collapsed={collapsed}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="dashboard-shell__main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__left">
            <button
              className="dashboard-topbar__menu"
              aria-label="Toggle sidebar"
              onClick={() => {
                if (window.innerWidth <= 980) {
                  setMobileOpen((v) => !v);
                } else {
                  setCollapsed((v) => !v);
                }
              }}
            >
              {collapsed ? (
                <svg className="dashboard-topbar__menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M8 5.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 18.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4.5 4.5V19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="dashboard-topbar__menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 5.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 18.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M19.5 4.5V19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          <div className="dashboard-topbar__right">
            <ThemeSwitcher />
            <button className="dashboard-topbar__icon" aria-label="Notifications">
              <Bell size={17} />
              <span className="dashboard-topbar__badge">2</span>
            </button>
            <button className="dashboard-topbar__user" onClick={() => navigate("/dashboard/profile")}>JD</button>
          </div>
        </header>

        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
