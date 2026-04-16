import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, ChevronDown, AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const toUiValue = (value) => {
  if (!value) return "";
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
  status: toUiValue(ticket.status) || "Open",
  reporter: ticket.userId || "Unknown user",
  date: formatDate(ticket.createdAt || ticket.updatedAt),
  location: ticket.location || "Location not provided",
  assignee: ticket.assignedTo || "",
});

const iconByStatus = {
  Open: AlertTriangle,
  "In Progress": Clock,
  Resolved: CheckCircle2,
};

export default function TicketListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await ticketService.getAllTickets();
        const list = Array.isArray(response) ? response : [];
        setTickets(list.map(mapTicket));
      } catch (error) {
        setLoadError(error.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const value = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const idText = ticket.id ? ticket.id.toLowerCase() : "";
      const matchesSearch = !value || idText.includes(value) || ticket.title.toLowerCase().includes(value);
      const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "All Priority" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Incident Tickets</h1>
          <p>Report and track maintenance issues across campus</p>
        </div>
        <button className="ticket-list-page__add-btn" onClick={() => navigate("/dashboard/incidents/new")}>
          <Plus size={16} />
          <span>New Ticket</span>
        </button>
      </header>

      <div className="ticket-list-page__stats">
        <article className="ticket-list-page__stat-card">
          <h2>{stats.total}</h2>
          <p>Total Tickets</p>
        </article>
        <article className="ticket-list-page__stat-card ticket-list-page__stat-card--open">
          <h2>{stats.open}</h2>
          <p>Open</p>
        </article>
        <article className="ticket-list-page__stat-card ticket-list-page__stat-card--progress">
          <h2>{stats.inProgress}</h2>
          <p>In Progress</p>
        </article>
        <article className="ticket-list-page__stat-card ticket-list-page__stat-card--resolved">
          <h2>{stats.resolved}</h2>
          <p>Resolved</p>
        </article>
      </div>

      <div className="ticket-list-page__toolbar">
        <div className="ticket-list-page__search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title or ticket ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <label className="ticket-list-page__select-wrap">
          <Filter size={16} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <ChevronDown size={14} />
        </label>

        <label className="ticket-list-page__select-wrap">
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="ticket-list-page__cards">
        {loading ? <p className="ticket-list-page__empty">Loading tickets...</p> : null}
        {!loading && loadError ? <p className="ticket-list-page__empty">{loadError}</p> : null}
        {filteredTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="ticket-list-page__card"
            onClick={() => ticket.id && navigate(`/dashboard/incidents/${ticket.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (ticket.id) {
                  navigate(`/dashboard/incidents/${ticket.id}`);
                }
              }
            }}
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
              <span className={`ticket-list-page__status ticket-list-page__status--${ticket.status.toLowerCase().replace(" ", "-")}`}>{ticket.status}</span>
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
              {ticket.assignee ? (
                <>
                  <span>•</span>
                  <span className="ticket-list-page__assignee">&#8594; {ticket.assignee}</span>
                </>
              ) : null}
            </div>

            <span className="ticket-list-page__arrow"><ArrowRight size={16} /></span>
          </article>
        ))}
      </div>

      {!loading && !loadError && filteredTickets.length === 0 ? <p className="ticket-list-page__empty">No tickets found.</p> : null}
    </section>
  );
}
