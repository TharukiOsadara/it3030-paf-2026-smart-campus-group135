import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown, AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const ADMIN_TICKET_READ_KEY = "sc_admin_ticket_reads_v1";
const TECH_ASSIGNMENTS_KEY = "sc_technician_assignments_v1";
const TECH_WORKFLOW_KEY = "sc_technician_workflow_v1";
const ADMIN_SENT_TO_USER_KEY = "sc_admin_sent_to_user_v1";

const getCurrentUserId = () =>
  localStorage.getItem("sc_user_id") ||
  localStorage.getItem("userId") ||
  "admin-user";

const readViewedTicketIds = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_TICKET_READ_KEY) || "{}");
    const list = Array.isArray(parsed[userId]) ? parsed[userId] : [];
    return Array.from(new Set(list.filter(Boolean)));
  } catch {
    return [];
  }
};

const saveViewedTicketId = (userId, ticketId) => {
  if (!userId || !ticketId) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_TICKET_READ_KEY) || "{}");
    const list = Array.isArray(parsed[userId]) ? parsed[userId] : [];
    parsed[userId] = Array.from(new Set([...list, ticketId]));
    localStorage.setItem(ADMIN_TICKET_READ_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore localStorage access issues.
  }
};

const readSentToUserMap = (userId) => {
  if (!userId) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_SENT_TO_USER_KEY) || "{}");
    return parsed[userId] && typeof parsed[userId] === "object" ? parsed[userId] : {};
  } catch {
    return {};
  }
};

const saveSentToUserFlag = (userId, ticketId) => {
  if (!userId || !ticketId) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_SENT_TO_USER_KEY) || "{}");
    const userMap = parsed[userId] && typeof parsed[userId] === "object" ? parsed[userId] : {};
    userMap[ticketId] = true;
    parsed[userId] = userMap;
    localStorage.setItem(ADMIN_SENT_TO_USER_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore localStorage access issues.
  }
};

const readAssignedTicketIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_ASSIGNMENTS_KEY) || "{}");
    const merged = Object.values(parsed)
      .flatMap((ids) => (Array.isArray(ids) ? ids : []))
      .filter(Boolean);
    return Array.from(new Set(merged));
  } catch {
    return [];
  }
};

const readTechWorkflowMap = () => {
  try {
    return JSON.parse(localStorage.getItem(TECH_WORKFLOW_KEY) || "{}");
  } catch {
    return {};
  }
};

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

const extractTaggedMessage = (items, tag) => {
  if (!Array.isArray(items)) return "";
  const tagged = items.filter((item) => (item?.content || "").startsWith(tag)).at(-1);
  return tagged ? (tagged.content || "").replace(tag, "").trim() : "";
};

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
  description: ticket.description || "No description provided.",
  adminSolution: extractTaggedMessage(ticket.comments, "[Admin Solution]"),
  technicianSolution: extractTaggedMessage(ticket.comments, "[Technician Solution]"),
  technicianResolution: extractTaggedMessage(ticket.comments, "[Technician Resolution]"),
  adminReply: extractTaggedMessage(ticket.comments, "[Admin]"),
});

const iconByStatus = {
  Open: AlertTriangle,
  "In Progress": Clock,
  Resolved: CheckCircle2,
};

export default function TicketListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const statusSelectRef = useRef(null);
  const prioritySelectRef = useRef(null);
  const currentUserId = getCurrentUserId();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [viewedTicketIds, setViewedTicketIds] = useState(() => readViewedTicketIds(currentUserId));
  const [sentUserMessages, setSentUserMessages] = useState({});
  const [sentToUserIds, setSentToUserIds] = useState(() => readSentToUserMap(currentUserId));

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

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const tab = (params.get("tab") || "").toLowerCase();
    if (tab === "resolved") {
      setStatusFilter("Resolved");
    }
  }, [location.search]);

  const ticketsWithAdminResolution = useMemo(() => {
    const assignedTicketIds = readAssignedTicketIds();
    const workflowMap = readTechWorkflowMap();

    return tickets.map((ticket) => {
      const workflow = workflowMap[ticket.id] || {};
      const hasTechnicianUpdate = Boolean(ticket.technicianSolution || ticket.technicianResolution || workflow.submittedSolution || workflow.resolutionText);
      const adminResolved = ticket.status === "Resolved" || hasTechnicianUpdate || Boolean(workflow.resolved);
      const sentToTechnician = Boolean(ticket.assignee || assignedTicketIds.includes(ticket.id));
      const openedByAdmin = viewedTicketIds.includes(ticket.id);

      let bucket = "Total";
      if (adminResolved) {
        bucket = "Resolved";
      } else if (sentToTechnician || ticket.status === "In Progress") {
        bucket = "In Progress";
      } else if (openedByAdmin && ticket.status === "Open") {
        bucket = "Open";
      }

      const displayStatus =
        bucket === "Total"
          ? "New"
          : bucket;

      return {
        ...ticket,
        adminResolved,
        resolutionSource: (ticket.adminSolution || ticket.adminReply) ? "Admin" : (hasTechnicianUpdate ? "Technician" : "Unknown"),
        bucket,
        displayStatus,
      };
    });
  }, [tickets, viewedTicketIds]);

  const stats = useMemo(() => {
    return {
      total: ticketsWithAdminResolution.length,
      open: ticketsWithAdminResolution.filter((ticket) => ticket.bucket === "Open").length,
      inProgress: ticketsWithAdminResolution.filter((ticket) => ticket.bucket === "In Progress").length,
      resolved: ticketsWithAdminResolution.filter((ticket) => ticket.bucket === "Resolved").length,
      totalOnly: ticketsWithAdminResolution.filter((ticket) => ticket.bucket === "Total").length,
    };
  }, [ticketsWithAdminResolution, viewedTicketIds]);

  const filteredTickets = useMemo(() => {
    const value = search.trim().toLowerCase();
    return ticketsWithAdminResolution.filter((ticket) => {
      const idText = ticket.id ? ticket.id.toLowerCase() : "";
      const matchesSearch = !value || idText.includes(value) || ticket.title.toLowerCase().includes(value);
      const matchesStatus =
        (statusFilter === "All Status" && ticket.bucket === "Total") ||
        (statusFilter === "Open" && ticket.bucket === "Open") ||
        (statusFilter === "In Progress" && ticket.bucket === "In Progress") ||
        (statusFilter === "Resolved" && ticket.bucket === "Resolved");
      const matchesPriority = priorityFilter === "All Priority" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [search, statusFilter, priorityFilter, ticketsWithAdminResolution, viewedTicketIds]);

  const handleOpenTicket = (ticketId) => {
    if (!ticketId) return;
    saveViewedTicketId(currentUserId, ticketId);
    setViewedTicketIds((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
    navigate(`/dashboard/incidents/${ticketId}`);
  };

  const handleSendToUser = async (ticket, event) => {
    event.stopPropagation();
    if (!ticket?.id) return;

    const message = (sentUserMessages[ticket.id] || ticket.adminReply || "Update from admin").trim();
    const solution = (ticket.adminSolution || "").trim();

    try {
      if (solution) {
        await ticketService.addComment(ticket.id, { content: `[Admin Solution] ${solution}` });
      }
      await ticketService.addComment(ticket.id, { content: `[Admin] ${message}` });
      setSentUserMessages((prev) => ({ ...prev, [ticket.id]: message }));
      setTickets((prev) => prev.map((item) => (
        item.id === ticket.id
          ? { ...item, adminReply: message, adminSolution: solution || item.adminSolution, status: "Resolved" }
          : item
      )));
      setSentToUserIds((prev) => ({ ...prev, [ticket.id]: true }));
      saveSentToUserFlag(currentUserId, ticket.id);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Failed to send message to user");
    }
  };

  const openNativeSelect = (ref) => {
    const element = ref?.current;
    if (!element) return;
    if (typeof element.showPicker === "function") {
      element.showPicker();
      return;
    }
    element.focus();
  };

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Incident Tickets</h1>
          <p>Report and track maintenance issues across campus</p>
        </div>
        {stats.totalOnly > 0 ? (
          <p
            className="ticket-list-page__status"
            style={{
              marginLeft: "auto",
              alignSelf: "flex-start",
              borderColor: "rgba(255, 182, 77, 0.56)",
              color: "#ffd18f",
              background: "rgba(117, 63, 0, 0.23)",
              fontWeight: 700,
            }}
          >
            {stats.totalOnly} new ticket(s) waiting to be opened
          </p>
        ) : null}
      </header>

      <div className="ticket-list-page__stats">
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--total ${statusFilter === "All Status" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("All Status")}
          role="button"
          tabIndex={0}
          aria-pressed={statusFilter === "All Status"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setStatusFilter("All Status");
            }
          }}
        >
          <h2>{stats.totalOnly}</h2>
          <p>Total Tickets</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--open ${statusFilter === "Open" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("Open")}
          role="button"
          tabIndex={0}
          aria-pressed={statusFilter === "Open"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setStatusFilter("Open");
            }
          }}
        >
          <h2>{stats.open}</h2>
          <p>Open</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--progress ${statusFilter === "In Progress" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("In Progress")}
          role="button"
          tabIndex={0}
          aria-pressed={statusFilter === "In Progress"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setStatusFilter("In Progress");
            }
          }}
        >
          <h2>{stats.inProgress}</h2>
          <p>In Progress</p>
        </article>
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--resolved ${statusFilter === "Resolved" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("Resolved")}
          role="button"
          tabIndex={0}
          aria-pressed={statusFilter === "Resolved"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setStatusFilter("Resolved");
            }
          }}
        >
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
          <select ref={statusSelectRef} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <ChevronDown size={14} />
        </label>

        <label
          className="ticket-list-page__select-wrap"
          onMouseDown={(event) => {
            if (event.target.tagName.toLowerCase() !== "select") {
              event.preventDefault();
              openNativeSelect(prioritySelectRef);
            }
          }}
        >
          <select ref={prioritySelectRef} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
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
            onClick={() => handleOpenTicket(ticket.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenTicket(ticket.id);
              }
            }}
            style={ticket.bucket === "Total"
              ? {
                borderColor: "rgba(255, 175, 59, 0.66)",
                boxShadow: "0 0 0 1px rgba(255, 175, 59, 0.25), 0 14px 30px rgba(140, 84, 7, 0.24)",
              }
              : undefined}
          >
            {ticket.adminResolved && sentToUserIds[ticket.id] ? (
              <span className="ticket-list-page__sent-check" aria-label="Sent to user">
                <CheckCircle2 size={18} />
              </span>
            ) : null}

            <div className="ticket-list-page__card-top">
              <div className="ticket-list-page__identity">
                <span className="ticket-list-page__ticket-icon">
                  {(() => {
                    const StatusIcon = iconByStatus[ticket.status] || AlertTriangle;
                    return <StatusIcon size={20} />;
                  })()}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="ticket-list-page__ticket-id">{ticket.id}</span>
                  </div>
                  <h3>{ticket.title}</h3>
                </div>
              </div>
              {ticket.bucket === "Total" ? (
                <span
                  className="ticket-list-page__tag"
                  style={{
                    borderColor: "rgba(255, 226, 132, 0.72)",
                    color: "#ffecb5",
                    background: "rgba(247, 210, 105, 0.2)",
                    fontWeight: 700,
                    marginRight: "0.45rem",
                    alignSelf: "center",
                  }}
                >
                  New
                </span>
              ) : null}
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

            {ticket.adminResolved ? (
              <div className="ticket-list-page__details-row" style={{ marginTop: "0.55rem", color: "#b9cdfb", display: "grid", gap: "0.35rem" }}>
                <span><strong>User Ticket:</strong> {ticket.description}</span>
                <span><strong>Technician Solution:</strong> {ticket.technicianResolution || ticket.technicianSolution || "No technician solution yet."}</span>
                <span><strong>Admin Solution:</strong> {ticket.adminSolution || "No admin solution yet."}</span>
                <span><strong>Source:</strong> {ticket.resolutionSource}</span>
                <span><strong>Admin Reply:</strong> {sentUserMessages[ticket.id] || ticket.adminReply || "Not sent yet."}</span>
              </div>
            ) : null}

            {ticket.adminResolved ? (
              <div style={{ marginTop: "0.6rem" }}>
                <button
                  type="button"
                  className={`ticket-list-page__send-user-btn ${sentToUserIds[ticket.id] ? "ticket-list-page__send-user-btn--sent" : ""}`}
                  onClick={(event) => handleSendToUser(ticket, event)}
                  disabled={Boolean(sentToUserIds[ticket.id])}
                >
                  {sentToUserIds[ticket.id] ? "Sent to User" : "Send to User"}
                </button>
              </div>
            ) : null}

            <span className="ticket-list-page__arrow"><ArrowRight size={16} /></span>
          </article>
        ))}
      </div>

      {!loading && !loadError && filteredTickets.length === 0 ? <p className="ticket-list-page__empty">No tickets found.</p> : null}
    </section>
  );
}
