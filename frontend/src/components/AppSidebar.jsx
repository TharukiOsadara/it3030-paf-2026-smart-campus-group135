import { Building2, Calendar, Wrench, Bell, LayoutDashboard, User, LogOut, GraduationCap } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Facilities", url: "/dashboard/facilities", icon: Building2 },
  { title: "Bookings", url: "/dashboard/bookings", icon: Calendar },
  { title: "Tickets", url: "/dashboard/tickets", icon: Wrench },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const accountItems = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function AppSidebar({ collapsed = false, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`app-sidebar ${collapsed ? "app-sidebar--collapsed" : ""}`}>
      <div className="app-sidebar__inner">
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-icon">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="app-sidebar__brand-text">Smart<span>Campus</span></span>}
        </div>

        <div className="app-sidebar__section">
          {!collapsed && <p className="app-sidebar__section-title">Main</p>}
          <ul className="app-sidebar__menu">
            {mainItems.map((item) => (
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
            ))}
          </ul>
        </div>

        <div className="app-sidebar__section">
          {!collapsed && <p className="app-sidebar__section-title">Account</p>}
          <ul className="app-sidebar__menu">
            {accountItems.map((item) => (
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
            ))}
          </ul>
        </div>
      </div>

      <div className="app-sidebar__footer">
        <button className="app-sidebar__link app-sidebar__signout" onClick={() => navigate("/")}>
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
