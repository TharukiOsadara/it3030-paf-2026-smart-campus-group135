import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wrench, Search, AlertTriangle, Clock3, CheckCircle2 } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const TECH_ASSIGNMENTS_KEY = "sc_technician_assignments_v1";

const getCurrentUserId = () =>
  localStorage.getItem("sc_user_id") ||
  localStorage.getItem("userId") ||
  "technician-1";

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

const mapTicket = (ticket) => ({
  id: resolveTicketId(ticket),
  title: ticket.title || "Untitled incident",
  category: toUiValue(ticket.category) || "General",
  priority: toUiValue(ticket.priority) || "Medium",
  status: normalizeStatus(ticket.status),
  reporter: ticket.userId || "Unknown user",
  date: formatDate(ticket.createdAt || ticket.updatedAt),
  location: ticket.location || "Location not provided",
  assignee: ticket.assignedTo || "",
});

const iconByStatus = {
  Open: AlertTriangle,
  "In Progress": Clock3,
  Resolved: CheckCircle2,
};

const readAssignedTicketIds = (technicianId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_ASSIGNMENTS_KEY) || "{}");
    const list = Array.isArray(parsed[technicianId]) ? parsed[technicianId] : [];
    return Array.from(new Set(list.filter(Boolean)));
  } catch {
    return [];
  }
};

export default function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("ticketId") || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const technicianId = getCurrentUserId();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const localAssignedIds = readAssignedTicketIds(technicianId);
        const allTickets = await ticketService.getAllTickets();
        const list = Array.isArray(allTickets) ? allTickets : [];

        const mapped = list.map(mapTicket);
        const mapById = new Map(mapped.map((item) => [item.id, item]));

        const missingIds = localAssignedIds.filter((id) => id && !mapById.has(id));
        for (const missingId of missingIds) {
          try {
            const one = await ticketService.getTicketById(missingId);
            const mappedOne = mapTicket(one);
            if (mappedOne.id) {
              mapById.set(mappedOne.id, mappedOne);
            }
          } catch {
            // Ignore stale assignments.
          }
        }

        const finalList = Array.from(mapById.values()).filter(
          (ticket) => ticket.assignee === technicianId || localAssignedIds.includes(ticket.id)
        );

        setTickets(finalList);
      } catch (error) {
        setLoadError(error.message || "Failed to load technician tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [technicianId]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
  }), [tickets]);

  const filteredTickets = useMemo(() => {
    const value = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const idText = ticket.id ? ticket.id.toLowerCase() : "";
      const matchesSearch = !value || idText.includes(value) || ticket.title.toLowerCase().includes(value);
      const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tickets]);

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Technician Dashboard</h1>
          <p>Tickets assigned by admins for technical resolution</p>
        </div>
        <button className="ticket-list-page__add-btn" onClick={() => navigate("/dashboard/incidents")}>
          <Wrench size={16} />
          <span>Admin Tickets</span>
        </button>
      </header>

      <div className="ticket-list-page__stats">
        <article
          className={`ticket-list-page__stat-card ${statusFilter === "All Status" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("All Status")}
          role="button"
          tabIndex={0}
        >
          <h2>{stats.total}</h2>
          <p>Total Tickets</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--open ${statusFilter === "Open" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("Open")}
          role="button"
          tabIndex={0}
        >
          <h2>{stats.open}</h2>
          <p>Open</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--progress ${statusFilter === "In Progress" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("In Progress")}
          role="button"
          tabIndex={0}
        >
          <h2>{stats.inProgress}</h2>
          <p>In Progress</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--resolved ${statusFilter === "Resolved" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("Resolved")}
          role="button"
          tabIndex={0}
        >
          <h2>{stats.resolved}</h2>
          <p>Resolved</p>
        </article>
      </div>

      <div className="ticket-list-page__toolbar" style={{ gridTemplateColumns: "1fr" }}>
        <div className="ticket-list-page__search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search assigned tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="ticket-list-page__cards">
        {loading ? <p className="ticket-list-page__empty">Loading technician tickets...</p> : null}
        {!loading && loadError ? <p className="ticket-list-page__empty">{loadError}</p> : null}
        {!loading && !loadError && filteredTickets.length === 0 ? (
          <p className="ticket-list-page__empty">No assigned tickets found.</p>
        ) : null}

        {filteredTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="ticket-list-page__card"
            onClick={() => navigate(`/dashboard/technician/${ticket.id}/solve`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/dashboard/technician/${ticket.id}/solve`);
              }
            }}
            style={ticket.id === highlightId ? { borderColor: "rgba(128, 169, 255, 0.72)" } : undefined}
          >
            <div className="ticket-list-page__card-top">
              <div className="ticket-list-page__identity">
                <span className="ticket-list-page__ticket-icon">
                  {(() => {
                    const StatusIcon = iconByStatus[ticket.status] || AlertTriangle;
                    return <StatusIcon size={20} />;
                  })()}
                </span>
                <div>
                  <span className="ticket-list-page__ticket-id">{ticket.id}</span>
                  <h3>{ticket.title}</h3>
                </div>
              </div>
              <span className={`ticket-list-page__status ticket-list-page__status--${ticket.status.toLowerCase().replace(" ", "-")}`}>
                {ticket.status}
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
              <span>by {ticket.reporter}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
