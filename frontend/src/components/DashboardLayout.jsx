import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppSidebar } from "./AppSidebar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

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
