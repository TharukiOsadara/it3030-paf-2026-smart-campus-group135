import { useNavigate } from "react-router-dom";

export default function DashboardSectionPage({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page page-wrapper animate-fadeIn">
      <header className="dashboard-head">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <section className="dashboard-panels-grid">
        <article className="dashboard-panel">
          <header className="dashboard-panel__head">
            <h2>{title} Overview</h2>
          </header>
          <div className="dashboard-list">
            <div className="dashboard-list-item">
              <div>
                <p className="dashboard-list-item__title">Manage {title.toLowerCase()} quickly</p>
                <p className="dashboard-list-item__meta">Use the quick actions below to continue.</p>
              </div>
              <span className="dashboard-tag dashboard-tag--pending">ACTIVE</span>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <header className="dashboard-panel__head">
            <h2>Quick Actions</h2>
          </header>
          <div className="dashboard-actions">
            <button className="dashboard-action-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            <button className="dashboard-action-btn" onClick={() => navigate("/tickets/new")}>Create Ticket</button>
            <button className="dashboard-action-btn" onClick={() => navigate("/contact")}>Contact Support</button>
          </div>
        </article>
      </section>
    </div>
  );
}
