import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ticketService } from "../services/TicketServices";
import { InlineLoader, SkeletonCard } from "../components/PageShell";
import "./TicketList.css";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORY_OPTIONS = ["ALL", "ELECTRICAL", "PLUMBING", "HVAC", "IT_EQUIPMENT", "STRUCTURAL", "CLEANING", "SAFETY", "OTHER"];

export default function TicketListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filters, setFilters]   = useState({ status: "ALL", priority: "ALL", category: "ALL", search: "" });
  const [sortBy, setSortBy]     = useState("createdAt");
  const [sortDir, setSortDir]   = useState("desc");
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [filters, sortBy, sortDir, page]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: 10,
        sortBy,
        sortDir,
        ...(filters.status   !== "ALL" && { status:   filters.status }),
        ...(filters.priority !== "ALL" && { priority: filters.priority }),
        ...(filters.category !== "ALL" && { category: filters.category }),
        ...(filters.search   && { search: filters.search }),
      };
      const data = await ticketService.getMyTickets(params);
      setTickets(data.content || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Failed to load tickets. Please try again.");
      // Fallback mock data for UI display
      setTickets(MOCK_TICKETS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(0);
  };

  const priorityClass = (p) => {
    const map = { LOW: "badge-low", MEDIUM: "badge-medium", HIGH: "badge-high", CRITICAL: "badge-critical" };
    return map[p] || "badge-low";
  };
  const statusClass = (s) => {
    const map = { OPEN:"badge-open", IN_PROGRESS:"badge-in-progress", RESOLVED:"badge-resolved", CLOSED:"badge-closed", REJECTED:"badge-rejected" };
    return map[s] || "badge-closed";
  };

  return (
    <div className="ticket-list-page page-wrapper">
      {/* HEADER */}
      <div className="ticket-list-header">
        <div className="ticket-list-header__inner">
          <div>
            <p className="ticket-list-header__eyebrow">My Tickets</p>
            <h1 className="ticket-list-header__title">Incident Tickets</h1>
            <p className="ticket-list-header__sub">Track, manage, and follow up on all reported incidents.</p>
          </div>
          <button className="btn btn-gradient" onClick={() => navigate("/tickets/new")}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" transform="translate(-4 -4)"/>
            </svg>
            New Ticket
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="ticket-filters">
        <div className="ticket-filters__inner">
          {/* Search */}
          <div className="ticket-filters__search">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="ticket-filters__search-icon">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={e => handleFilterChange("search", e.target.value)}
              className="ticket-filters__search-input"
            />
          </div>

          {/* Status filter */}
          <div className="ticket-filters__chips">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`filter-chip ${filters.status === s ? "filter-chip--active" : ""}`}
                onClick={() => handleFilterChange("status", s)}
              >
                {s === "ALL" ? "All Status" : s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="ticket-filters__selects">
            <select
              value={filters.priority}
              onChange={e => handleFilterChange("priority", e.target.value)}
              className="ticket-filters__select"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={e => handleFilterChange("category", e.target.value)}
              className="ticket-filters__select"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c === "ALL" ? "All Categories" : c.replace("_", " ")}</option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={e => {
                const [sb, sd] = e.target.value.split("-");
                setSortBy(sb); setSortDir(sd); setPage(0);
              }}
              className="ticket-filters__select"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">Priority ↓</option>
              <option value="updatedAt-desc">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="ticket-list-content section">
        {error && (
          <div className="ticket-error">
            <span>⚠</span> {error}
          </div>
        )}

        {loading ? (
          <div className="ticket-skeletons">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="ticket-empty">
            <div className="ticket-empty__icon">🎉</div>
            <h3>No tickets found</h3>
            <p>No incidents match your current filters. Try adjusting your search or create a new ticket.</p>
            <button className="btn btn-primary" onClick={() => navigate("/tickets/new")}>Report an Issue</button>
          </div>
        ) : (
          <>
            <div className="ticket-grid">
              {tickets.map((t, i) => (
                <div
                  key={t.id || i}
                  className="ticket-card animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                  <div className="ticket-card__top">
                    <div className="ticket-card__badges">
                      <span className={`badge ${statusClass(t.status)}`}>
                        ● {t.status?.replace("_", " ")}
                      </span>
                      <span className={`badge ${priorityClass(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <span className="ticket-card__id">#{t.ticketNumber || t.id?.slice(-6).toUpperCase()}</span>
                  </div>

                  <h3 className="ticket-card__title">{t.title}</h3>
                  <p className="ticket-card__desc">{t.description?.substring(0, 100)}...</p>

                  <div className="ticket-card__meta">
                    <span className="ticket-card__meta-item">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="scale(0.54) translate(0,1)"/>
                      </svg>
                      {t.location}
                    </span>
                    <span className="ticket-card__meta-item">
                      📁 {t.category?.replace("_"," ")}
                    </span>
                    {t.attachments?.length > 0 && (
                      <span className="ticket-card__meta-item">
                        📎 {t.attachments.length} file{t.attachments.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {t.assignedTo && (
                    <div className="ticket-card__assignee">
                      <div className="ticket-card__assignee-avatar">T</div>
                      <span>Assigned to <strong>{t.assignedTo}</strong></span>
                    </div>
                  )}

                  <div className="ticket-card__footer">
                    <span className="ticket-card__date">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                    </span>
                    <span className="ticket-card__arrow">→</span>
                  </div>

                  <div className="ticket-card__priority-bar" data-priority={t.priority?.toLowerCase()} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="ticket-pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >← Prev</button>
                <span className="ticket-pagination__info">Page {page + 1} of {totalPages}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Mock data for fallback
const MOCK_TICKETS = [
  { id:"1", ticketNumber:"TK-001", title:"Projector not working in Lab A-302", description:"The projector in Laboratory A-302 has stopped working. Students cannot view slides during lectures.", status:"OPEN", priority:"HIGH", category:"IT_EQUIPMENT", location:"Block A, Room 302", createdAt:"2026-04-08T09:00:00", attachments:[{},{}] },
  { id:"2", ticketNumber:"TK-002", title:"Air conditioning unit making loud noise", description:"The AC unit in the staff room on 3rd floor is producing an unusually loud noise since yesterday.", status:"IN_PROGRESS", priority:"MEDIUM", category:"HVAC", location:"Block B, Staff Room 301", createdAt:"2026-04-07T14:30:00", assignedTo:"Ashan K.", attachments:[{}] },
  { id:"3", ticketNumber:"TK-003", title:"Water leakage near staircase entrance", description:"There is a water leak near the main staircase entrance of Building C. The floor is slippery and poses a safety risk.", status:"RESOLVED", priority:"CRITICAL", category:"PLUMBING", location:"Building C, Ground Floor", createdAt:"2026-04-05T11:00:00", attachments:[{},{},{}] },
];