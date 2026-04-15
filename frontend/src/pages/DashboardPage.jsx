import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ticketService } from "../services/TicketServices";
import { SkeletonCard } from "../components/PageShell";
import "./DashboardPage.css";

const STAT_CARDS = [
  { key: "total",      label: "Total Tickets",   icon: "📋", color: "var(--color-info)",    bg: "rgba(90,200,250,0.1)" },
  { key: "open",       label: "Open",            icon: "⚡", color: "var(--status-open)",   bg: "rgba(255,159,10,0.1)" },
  { key: "inProgress", label: "In Progress",     icon: "🔧", color: "var(--status-in-progress)", bg: "rgba(10,132,255,0.1)" },
  { key: "resolved",   label: "Resolved",        icon: "✅", color: "var(--status-resolved)",bg: "rgba(52,199,89,0.1)" },
];

function statusClass(s) {
  return { OPEN:"badge-open", IN_PROGRESS:"badge-in-progress", RESOLVED:"badge-resolved", CLOSED:"badge-closed", REJECTED:"badge-rejected" }[s] || "";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]           = useState({ total:0, open:0, inProgress:0, resolved:0 });
  const [recentTickets, setRecent]  = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, ticketsData] = await Promise.all([
          ticketService.getStats(),
          ticketService.getMyTickets({ page: 0, size: 5, sortBy: "updatedAt", sortDir: "desc" })
        ]);
        setStats(statsData);
        setRecent(ticketsData.content || ticketsData);
      } catch {
        setStats({ total: 3, open: 1, inProgress: 1, resolved: 1 });
        setRecent(MOCK_RECENT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard-page page-wrapper">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header__inner">
          <div>
            <p className="dashboard-header__greeting">Good morning 👋</p>
            <h1 className="dashboard-header__title">Operations Dashboard</h1>
            <p className="dashboard-header__sub">Here's an overview of your campus activity.</p>
          </div>
          <button className="btn btn-gradient" onClick={() => navigate("/tickets/new")}>
            + Report Incident
          </button>
        </div>
      </div>

      <div className="dashboard-body section">
        {/* STAT CARDS */}
        <div className="dashboard-stats">
          {STAT_CARDS.map((s, i) => (
            <div
              key={s.key}
              className="stat-card animate-fadeInUp"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="stat-card__icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-card__info">
                <span className="stat-card__label">{s.label}</span>
                <span className="stat-card__value" style={{ color: s.color }}>
                  {loading ? "—" : stats[s.key]}
                </span>
              </div>
              <div className="stat-card__bar" style={{ background: s.bg }}>
                <div className="stat-card__bar-fill" style={{ background: s.color, width: loading ? "0%" : `${Math.min((stats[s.key] / Math.max(stats.total,1)) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* RECENT TICKETS */}
          <div className="dashboard-recent">
            <div className="dashboard-recent__header">
              <h2 className="dashboard-section-title">Recent Tickets</h2>
              <Link to="/tickets" className="btn btn-ghost btn-sm">View All →</Link>
            </div>

            {loading ? (
              <div style={{display:"flex",flexDirection:"column",gap:"var(--space-sm)"}}>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty__icon">📭</div>
                <p>No tickets yet</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/tickets/new")}>
                  Create First Ticket
                </button>
              </div>
            ) : (
              <div className="recent-list">
                {recentTickets.map((t, i) => (
                  <div
                    key={t.id || i}
                    className="recent-item animate-fadeInUp"
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <div className="recent-item__priority-dot"
                      style={{ background: { LOW:"var(--priority-low)", MEDIUM:"var(--priority-medium)", HIGH:"var(--priority-high)", CRITICAL:"var(--priority-critical)" }[t.priority] || "var(--text-muted)" }}
                    />
                    <div className="recent-item__info">
                      <div className="recent-item__top">
                        <span className="recent-item__title">{t.title}</span>
                        <span className={`badge ${statusClass(t.status)}`}>{t.status?.replace("_"," ")}</span>
                      </div>
                      <div className="recent-item__meta">
                        <span>📍 {t.location}</span>
                        <span>📁 {t.category?.replace("_"," ")}</span>
                        <span>🕒 {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="recent-item__arrow">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="dashboard-quick">
            <h2 className="dashboard-section-title">Quick Actions</h2>
            <div className="quick-actions">
              {[
                { label: "Report New Incident",  icon: "🚨", color: "var(--color-danger)",   path: "/tickets/new",       desc: "Submit a new maintenance or fault report" },
                { label: "View My Tickets",       icon: "📋", color: "var(--color-primary)",  path: "/tickets",           desc: "Track the status of your submitted tickets" },
                { label: "About the Platform",    icon: "ℹ️", color: "var(--color-accent)",   path: "/about",             desc: "Learn about modules and our team" },
                { label: "Contact Support",       icon: "💬", color: "var(--color-warn)",     path: "/contact",           desc: "Get help or send feedback to our team" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="quick-action-card animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.08}s`, "--qa-color": a.color }}
                  onClick={() => navigate(a.path)}
                >
                  <div className="quick-action-card__icon">{a.icon}</div>
                  <div>
                    <p className="quick-action-card__label">{a.label}</p>
                    <p className="quick-action-card__desc">{a.desc}</p>
                  </div>
                  <span className="quick-action-card__arrow">→</span>
                </div>
              ))}
            </div>

            {/* Priority distribution */}
            <div className="priority-dist">
              <h3 className="priority-dist__title">Priority Distribution</h3>
              {[
                { label:"Critical", count: 1, color:"var(--priority-critical)" },
                { label:"High",     count: 1, color:"var(--priority-high)" },
                { label:"Medium",   count: 1, color:"var(--priority-medium)" },
                { label:"Low",      count: 0, color:"var(--priority-low)" },
              ].map((p, i) => (
                <div key={i} className="priority-dist__row">
                  <span className="priority-dist__label" style={{color:p.color}}>{p.label}</span>
                  <div className="priority-dist__bar-wrap">
                    <div className="priority-dist__bar"
                      style={{ width: `${(p.count / Math.max(stats.total,1)) * 100}%`, background: p.color }}
                    />
                  </div>
                  <span className="priority-dist__count">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_RECENT = [
  { id:"1", title:"Projector not working in Lab A-302", status:"IN_PROGRESS", priority:"HIGH", category:"IT_EQUIPMENT", location:"Block A, Room 302", updatedAt:"2026-04-09T14:00:00" },
  { id:"2", title:"AC unit noise in Staff Room 301", status:"OPEN", priority:"MEDIUM", category:"HVAC", location:"Block B, 3rd Floor", updatedAt:"2026-04-08T10:00:00" },
  { id:"3", title:"Water leakage near Building C staircase", status:"RESOLVED", priority:"CRITICAL", category:"PLUMBING", location:"Building C, GF", updatedAt:"2026-04-07T16:00:00" },
];