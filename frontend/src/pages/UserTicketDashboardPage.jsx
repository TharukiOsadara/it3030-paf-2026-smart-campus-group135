import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, ChevronDown, AlertTriangle, Clock3, CheckCircle2, ArrowRight } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const toUiValue = (value) => {
  if (!value) return "";
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeStatus = (value) => {
  const ui = toUiValue(value) || "Open";
  if (ui === "Closed") return "Resolved";
  return ui;
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const resolveTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || "";

const getAdminReplyCount = (ticket) => {
  const activities = Array.isArray(ticket.activities) ? ticket.activities : [];
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];

  const activityReplies = activities.filter((item) =>
    ["ADMIN", "STAFF", "TECHNICIAN"].includes((item.actorRole || "").toUpperCase())
  ).length;

  const commentReplies = comments.filter((item) =>
    ["ADMIN", "STAFF", "TECHNICIAN"].includes((item.userRole || "").toUpperCase())
  ).length;

  return activityReplies + commentReplies;
};

const mapTicket = (ticket) => ({
  id: resolveTicketId(ticket),
  title: ticket.title || "Untitled incident",
  category: toUiValue(ticket.category) || "General",
  priority: toUiValue(ticket.priority) || "Medium",
  status: normalizeStatus(ticket.status),
  date: formatDate(ticket.createdAt || ticket.updatedAt),
  location: ticket.location || "Location not provided",
  responses: getAdminReplyCount(ticket),
});

const statusIconMap = {
  Open: AlertTriangle,
  "In Progress": Clock3,
  Resolved: CheckCircle2,
};

const normalizeDashboardStatus = (tab) => {
  if (tab === "Pending") return "Pending";
  if (tab === "Solved") return "Resolved";
  if (tab === "Admin Replies") return "Admin Replies";
  return "All Status";
};

export default function UserTicketDashboardPage() {
  const navigate = useNavigate();
  const statusSelectRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await ticketService.getMyTickets();
        setTickets((Array.isArray(response) ? response : []).map(mapTicket));
      } catch (error) {
        setLoadError(error.message || "Failed to load your tickets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter((ticket) => ticket.status !== "Resolved").length,
      solved: tickets.filter((ticket) => ticket.status === "Resolved").length,
      responses: tickets.reduce((sum, ticket) => sum + ticket.responses, 0),
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    const statusFilter = normalizeDashboardStatus(tab);
    return tickets.filter((ticket) => {
      const matchesSearch =
        !value ||
        ticket.title.toLowerCase().includes(value) ||
        ticket.id.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Admin Replies"
          ? ticket.responses > 0
          : false) ||
        (statusFilter === "Pending"
          ? ticket.status !== "Resolved"
          : ticket.status === "Resolved");

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, tab]);

  const openNativeSelect = (ref) => {
    const element = ref?.current;
    if (!element) return;
    if (typeof element.showPicker === "function") {
      element.showPicker();
      return;
    }
    element.focus();
  };

  const tabAsFilterValue = normalizeDashboardStatus(tab);

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header" style={{ justifyContent: "flex-start", alignItems: "center", gap: "10px" }}>
        <button
          className="ticket-detail-page__back"
          onClick={() => navigate("/dashboard/incidents/new")}
          aria-label="Back to create ticket"
          type="button"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1>My Ticket Dashboard</h1>
          <p>Read-only view of your submitted tickets and admin responses</p>
        </div>
      </header>

      <div className="ticket-list-page__stats">
        <article
          className={`ticket-list-page__stat-card ${tab === "All" ? "ticket-list-page__stat-card--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setTab("All")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTab("All");
            }
          }}
        >
          <h2>{stats.total}</h2>
          <p>Total Tickets</p>
        </article>

        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--open ${tab === "Pending" ? "ticket-list-page__stat-card--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setTab("Pending")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTab("Pending");
            }
          }}
        >
          <h2>{stats.pending}</h2>
          <p>Pending</p>
        </article>

        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--resolved ${tab === "Solved" ? "ticket-list-page__stat-card--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setTab("Solved")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTab("Solved");
            }
          }}
        >
          <h2>{stats.solved}</h2>
          <p>Resolved</p>
        </article>

        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--progress ${tab === "Admin Replies" ? "ticket-list-page__stat-card--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setTab("Admin Replies")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTab("Admin Replies");
            }
          }}
        >
          <h2>{stats.responses}</h2>
          <p>Admin Replies</p>
        </article>
      </div>

      <div className="ticket-list-page__toolbar" style={{ gridTemplateColumns: "minmax(240px, 1fr) 180px" }}>
        <div className="ticket-list-page__search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title or ticket ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <label
          className="ticket-list-page__select-wrap"
          onMouseDown={(event) => {
            if (event.target.tagName.toLowerCase() !== "select") {
              event.preventDefault();
              openNativeSelect(statusSelectRef);
            }
          }}
        >
          <Filter size={16} />
          <select
            ref={statusSelectRef}
            value={tabAsFilterValue}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "All Status") setTab("All");
              if (value === "Pending") setTab("Pending");
              if (value === "Resolved") setTab("Solved");
              if (value === "Admin Replies") setTab("Admin Replies");
            }}
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Admin Replies</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="ticket-list-page__cards">
        {loading ? <p className="ticket-list-page__empty">Loading tickets...</p> : null}
        {!loading && loadError ? <p className="ticket-list-page__empty">{loadError}</p> : null}
        {!loading && !loadError && filtered.length === 0 ? (
          <p className="ticket-list-page__empty">No tickets found.</p>
        ) : null}

        {filtered.map((ticket) => {
          const StatusIcon = statusIconMap[ticket.status] || AlertTriangle;
          const solved = ticket.status === "Resolved";

          return (
            <article
              key={ticket.id}
              className="ticket-list-page__card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/dashboard/my-tickets/${ticket.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/dashboard/my-tickets/${ticket.id}`);
                }
              }}
            >
              <div className="ticket-list-page__card-top">
                <div className="ticket-list-page__identity">
                  <span className="ticket-list-page__ticket-icon">
                    <StatusIcon size={20} />
                  </span>
                  <div>
                    <span className="ticket-list-page__ticket-id">{ticket.id}</span>
                    <h3>{ticket.title}</h3>
                  </div>
                </div>
                <span
                  className={`ticket-list-page__status ${
                    solved
                      ? "ticket-list-page__status--resolved"
                      : "ticket-list-page__status--open"
                  }`}
                >
                  {solved ? "Solved" : "Pending"}
                </span>
              </div>

              <div className="ticket-list-page__meta">
                <span className={`ticket-list-page__tag ticket-list-page__tag--${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <span className="ticket-list-page__tag ticket-list-page__tag--category">{ticket.category}</span>
              </div>

              <div className="ticket-list-page__details-row">
                <span>{ticket.location}</span>
                <span>•</span>
                <span>{ticket.date}</span>
                <span>•</span>
                <span>{ticket.responses} admin replies</span>
              </div>

              <span className="ticket-list-page__arrow"><ArrowRight size={16} /></span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
