import "./DashboardPage.css";

const STATS = [
  { title: "Total Resources", value: "156", note: "+12 this month", type: "resources" },
  { title: "Active Bookings", value: "43", note: "8 pending approval", type: "bookings" },
  { title: "Open Tickets", value: "12", note: "3 high priority", type: "tickets" },
  { title: "Notifications", value: "7", note: "2 unread", type: "notifications" },
];

const RECENT_BOOKINGS = [
  { resource: "Lecture Hall A1", when: "Apr 15, 2026 · 09:00 - 11:00", status: "APPROVED" },
  { resource: "Lab Equipment - Projector", when: "Apr 16, 2026 · 14:00 - 16:00", status: "PENDING" },
  { resource: "Meeting Room B3", when: "Apr 17, 2026 · 10:00 - 12:00", status: "PENDING" },
];

const RECENT_TICKETS = [
  { title: "Projector malfunction in A1", priority: "HIGH", status: "OPEN" },
  { title: "AC not working in Lab B2", priority: "MEDIUM", status: "IN_PROGRESS" },
  { title: "Broken chair in Meeting Room C1", priority: "LOW", status: "RESOLVED" },
];

function StatIcon({ type }) {
  if (type === "resources") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (type === "bookings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="4.8" width="17" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 3.2V6.2M16 3.2V6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "tickets") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.5 5.5A2.1 2.1 0 0 1 17.4 8.4L10.1 15.7L6.2 16.8L7.3 12.9L14.5 5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12.8 7.2L16 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 20A2.5 2.5 0 0 0 14.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashboard-page page-wrapper animate-fadeIn">
      <header className="dashboard-head">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your campus overview.</p>
      </header>

      <section className="dashboard-stats-grid">
        {STATS.map((card) => (
          <article key={card.title} className="dashboard-stat-card">
            <div className="dashboard-stat-card__text">
              <p className="dashboard-stat-card__title">{card.title}</p>
              <p className="dashboard-stat-card__value">{card.value}</p>
              <p className="dashboard-stat-card__note">{card.note}</p>
            </div>
            <div className={`dashboard-stat-card__icon dashboard-stat-card__icon--${card.type}`}>
              <StatIcon type={card.type} />
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-panels-grid">
        <article className="dashboard-panel">
          <header className="dashboard-panel__head">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.5" y="4.8" width="17" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 3.2V6.2M16 3.2V6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <h2>Recent Bookings</h2>
          </header>

          <div className="dashboard-list">
            {RECENT_BOOKINGS.map((item) => (
              <div key={item.resource} className="dashboard-list-item">
                <div>
                  <p className="dashboard-list-item__title">{item.resource}</p>
                  <p className="dashboard-list-item__meta">{item.when}</p>
                </div>
                <span className={`dashboard-tag dashboard-tag--${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <header className="dashboard-panel__head">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14.5 5.5A2.1 2.1 0 0 1 17.4 8.4L10.1 15.7L6.2 16.8L7.3 12.9L14.5 5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12.8 7.2L16 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <h2>Recent Tickets</h2>
          </header>

          <div className="dashboard-list">
            {RECENT_TICKETS.map((item) => (
              <div key={item.title} className="dashboard-list-item">
                <div>
                  <p className="dashboard-list-item__title">{item.title}</p>
                  <span className={`dashboard-chip dashboard-chip--${item.priority.toLowerCase()}`}>{item.priority}</span>
                </div>
                <span className={`dashboard-tag dashboard-tag--${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
