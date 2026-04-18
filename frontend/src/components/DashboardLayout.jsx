import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 980) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className={`dashboard-shell ${collapsed ? "dashboard-shell--collapsed" : ""} ${mobileOpen ? "dashboard-shell--mobile-open" : ""}`}>
      <AppSidebar
        collapsed={collapsed}
        onNavigate={() => setMobileOpen(false)}
        onToggle={handleToggleSidebar}
      />

      <div className="dashboard-shell__main">
        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}