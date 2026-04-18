import {
  Building2, Calendar, Bell, LayoutDashboard, User,
  LogOut, GraduationCap, PanelLeftClose, PanelLeftOpen,
  Wrench, ShieldCheck, Settings,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COMMON_MAIN = [
  { title: "Dashboard",     url: "/dashboard",              icon: LayoutDashboard },
  { title: "Facilities",    url: "/dashboard/facilities",   icon: Building2 },
  { title: "Bookings",      url: "/dashboard/bookings",     icon: Calendar },
  { title: "Notifications", url: "/dashboard/notifications",icon: Bell },
];

const ROLE_TAB = {
  ADMIN:      { title: "Tickets",    url: "/dashboard/incidents",          icon: ShieldCheck },
  USER:       { title: "My Tickets", url: "/dashboard/my-tickets",         icon: Wrench },
  TECHNICIAN: { title: "Technician", url: "/dashboard/technician?filter=Latest", icon: Settings },
};

const ACCOUNT_ITEMS = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function AppSidebar({ collapsed = false, onNavigate, onToggle }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();

  const role    = (user?.role || "USER").toUpperCase();
  const roleTab = ROLE_TAB[role] || ROLE_TAB.USER;

  const isActive = (path) => {
    const cleanPath = path.split("?")[0];
    return location.pathname === cleanPath;
  };

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const renderLink = (item) => (
    <li key={item.title}>
      <NavLink
        to={item.url}
        onClick={onNavigate}
        className={`app-sidebar__link ${isActive(item.url) ? "app-sidebar__link--active" : ""}`}
      >
        <item.icon size={16} />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    </li>
  );

  return (
    <aside className={`app-sidebar ${collapsed ? "app-sidebar--collapsed" : ""}`}>
      <div className="app-sidebar__inner">

        {/* Brand */}
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-icon">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="app-sidebar__brand-text">
              Smart<span>Campus</span>
            </span>
          )}
          <button
            type="button"
            className="app-sidebar__toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Main — common tabs */}
        <div className="app-sidebar__section">
          {!collapsed && <p className="app-sidebar__section-title">Main</p>}
          <ul className="app-sidebar__menu">
            {COMMON_MAIN.map(renderLink)}
          </ul>
        </div>

        {/* Role-specific tab */}
        <div className="app-sidebar__section">
          {!collapsed && <p className="app-sidebar__section-title">
            {role === "ADMIN" ? "Management" : role === "TECHNICIAN" ? "My Work" : "My Tickets"}
          </p>}
          <ul className="app-sidebar__menu">
            {renderLink(roleTab)}
          </ul>
        </div>

        {/* Account */}
        <div className="app-sidebar__section">
          {!collapsed && <p className="app-sidebar__section-title">Account</p>}
          <ul className="app-sidebar__menu">
            {ACCOUNT_ITEMS.map(renderLink)}
          </ul>
        </div>

      </div>

      {/* Sign Out */}
      <div className="app-sidebar__footer">
        {!collapsed && user && (
          <div style={{
            padding: "0.5rem 0.75rem 0.4rem",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
          }}>
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</p>
            <p>{user.email}</p>
            <p style={{
              display: "inline-block",
              marginTop: "0.2rem",
              padding: "0.1rem 0.45rem",
              borderRadius: 999,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              background:
                role === "ADMIN"      ? "hsla(43,96%,56%,0.18)" :
                role === "TECHNICIAN" ? "hsla(160,64%,52%,0.18)" :
                                        "hsla(219,91%,64%,0.18)",
              color:
                role === "ADMIN"      ? "hsl(var(--warning))" :
                role === "TECHNICIAN" ? "hsl(var(--success))" :
                                        "hsl(var(--primary))",
            }}>
              {role}
            </p>
          </div>
        )}
        <button
          className="app-sidebar__link app-sidebar__signout"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
