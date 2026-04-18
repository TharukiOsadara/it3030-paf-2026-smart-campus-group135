import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, AlertTriangle, Clock3, CheckCircle2, Trash2 } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const TECH_ASSIGNMENTS_KEY = "sc_technician_assignments_v1";
const TECH_VIEWED_KEY = "sc_technician_viewed_v1";
const TECH_WORKFLOW_KEY = "sc_technician_workflow_v1";
const TECH_DISMISSED_RESOLVED_KEY = "sc_technician_dismissed_resolved_v1";

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

const mapTicket = (ticket) => {
  const assignee = ticket.assignedTo || "";
  const rawStatus = normalizeStatus(ticket.status);
  const status = assignee && rawStatus === "Open" ? "In Progress" : rawStatus;

  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];
  const taggedSolution = comments
    .filter((item) => (item.content || "").startsWith("[Technician Solution]"))
    .at(-1);
  const taggedResolution = comments
    .filter((item) => (item.content || "").startsWith("[Technician Resolution]"))
    .at(-1);

  const sentSolutionText = taggedSolution
    ? (taggedSolution.content || "").replace("[Technician Solution]", "").trim()
    : "";
  const resolvedText = taggedResolution
    ? (taggedResolution.content || "").replace("[Technician Resolution]", "").trim()
    : "";

  return {
    id: resolveTicketId(ticket),
    title: ticket.title || "Untitled incident",
    category: toUiValue(ticket.category) || "General",
    priority: toUiValue(ticket.priority) || "Medium",
    status,
    reporter: ticket.userId || "Unknown user",
    date: formatDate(ticket.createdAt || ticket.updatedAt),
    location: ticket.location || "Location not provided",
    assignee,
    sentSolutionText,
    resolvedText,
  };
};

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

const readViewedTicketIds = (technicianId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_VIEWED_KEY) || "{}");
    const list = Array.isArray(parsed[technicianId]) ? parsed[technicianId] : [];
    return Array.from(new Set(list.filter(Boolean)));
  } catch {
    return [];
  }
};

const saveViewedTicketId = (technicianId, ticketId) => {
  if (!technicianId || !ticketId) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_VIEWED_KEY) || "{}");
    const list = Array.isArray(parsed[technicianId]) ? parsed[technicianId] : [];
    parsed[technicianId] = Array.from(new Set([...list, ticketId]));
    localStorage.setItem(TECH_VIEWED_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage access issues.
  }
};

const readWorkflowMap = () => {
  try {
    return JSON.parse(localStorage.getItem(TECH_WORKFLOW_KEY) || "{}");
  } catch {
    return {};
  }
};

const readDismissedResolved = (technicianId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_DISMISSED_RESOLVED_KEY) || "{}");
    const list = Array.isArray(parsed[technicianId]) ? parsed[technicianId] : [];
    return Array.from(new Set(list.filter(Boolean)));
  } catch {
    return [];
  }
};

const saveDismissedResolved = (technicianId, ticketId) => {
  if (!technicianId || !ticketId) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(TECH_DISMISSED_RESOLVED_KEY) || "{}");
    const list = Array.isArray(parsed[technicianId]) ? parsed[technicianId] : [];
    parsed[technicianId] = Array.from(new Set([...list, ticketId]));
    localStorage.setItem(TECH_DISMISSED_RESOLVED_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage access issues.
  }
};

export default function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("ticketId") || "";
  const queryFilter = searchParams.get("filter") || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const value = (queryFilter || "").trim();
    if (value.toLowerCase() === "latest") return "Open";
    if (["Open", "In Progress", "Resolved", "Critical"].includes(value)) return value;
    return "Open";
  });

  const technicianId = getCurrentUserId();
  const [viewedTicketIds, setViewedTicketIds] = useState(() => readViewedTicketIds(technicianId));
  const [workflowMap, setWorkflowMap] = useState(() => readWorkflowMap());
  const [dismissedResolvedIds, setDismissedResolvedIds] = useState(() => readDismissedResolved(technicianId));

  useEffect(() => {
    const value = (queryFilter || "").trim();
    if (!value) {
      setStatusFilter("Open");
      return;
    }
    if (value.toLowerCase() === "latest") {
      setStatusFilter("Open");
      return;
    }
    if (["Open", "In Progress", "Resolved", "Critical"].includes(value)) {
      setStatusFilter(value);
    }
  }, [queryFilter]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const localAssignedIds = readAssignedTicketIds(technicianId);
        let list = [];
        try {
          const allTickets = await ticketService.getAllTickets();
          list = Array.isArray(allTickets) ? allTickets : [];
        } catch {
          // Non-admin sessions may not access this endpoint.
        }

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
        setWorkflowMap(readWorkflowMap());
      } catch (error) {
        setLoadError(error.message || "Failed to load technician tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [technicianId]);

  const ticketsWithStage = useMemo(() => {
    return tickets.map((ticket) => {
      const workflow = workflowMap[ticket.id] || {};
      const seen = viewedTicketIds.includes(ticket.id);
      const sentToAdmin = Boolean(workflow.submittedToAdmin || ticket.sentSolutionText);
      const resolutionText = workflow.resolutionText || ticket.resolvedText || workflow.submittedSolution || ticket.sentSolutionText || "";
      const isResolved = ticket.status === "Resolved" || Boolean(workflow.resolved);
      const stageStatus = isResolved ? "Resolved" : seen ? "In Progress" : "Open";
      return { ...ticket, status: stageStatus, sentToAdmin, resolutionText };
    });
  }, [tickets, viewedTicketIds, workflowMap]);

  const visibleTickets = useMemo(
    () => ticketsWithStage.filter((ticket) => !dismissedResolvedIds.includes(ticket.id)),
    [ticketsWithStage, dismissedResolvedIds]
  );

  const stats = useMemo(() => ({
    open: visibleTickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: visibleTickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: visibleTickets.filter((ticket) => ticket.status === "Resolved").length,
    critical: visibleTickets.filter((ticket) => ["Critical", "High"].includes(ticket.priority) && ticket.status !== "Resolved").length,
  }), [visibleTickets]);

  const recentInProgressTickets = useMemo(
    () => visibleTickets.filter((ticket) => ticket.status === "In Progress").slice(0, 5),
    [visibleTickets]
  );

  const filteredTickets = useMemo(() => {
    const value = search.trim().toLowerCase();
    return visibleTickets.filter((ticket) => {
      const idText = ticket.id ? ticket.id.toLowerCase() : "";
      const matchesSearch = !value || idText.includes(value) || ticket.title.toLowerCase().includes(value);
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Critical"
          ? ["Critical", "High"].includes(ticket.priority) && ticket.status !== "Resolved"
          : ticket.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, visibleTickets]);

  const normalizedFilter = (statusFilter || "").trim().toLowerCase();
  const showRecentMaintenance = ["all status", "open", "in progress"].includes(normalizedFilter);

  const handleOpenTicket = (ticketId) => {
    if (!ticketId) return;
    saveViewedTicketId(technicianId, ticketId);
    setViewedTicketIds((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
    navigate(`/dashboard/technician/${ticketId}/solve`);
  };

  const dismissResolvedMessage = (ticketId, event) => {
    event.stopPropagation();
    if (!ticketId) return;
    saveDismissedResolved(technicianId, ticketId);
    setDismissedResolvedIds((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
  };

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Technician Dashboard</h1>
          <p>Tickets assigned by admins for technical resolution</p>
        </div>
      </header>

      <div className="ticket-list-page__stats">
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--open ${statusFilter === "Open" ? "ticket-list-page__stat-card--active" : ""}`}
          onClick={() => setStatusFilter("Open")}
          role="button"
          tabIndex={0}
        >
          <h2>{stats.open}</h2>
          <p>Latest</p>
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
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--critical ${statusFilter === "Critical" ? "ticket-list-page__stat-card--active" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Critical tickets"
          onClick={() => setStatusFilter("Critical")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setStatusFilter("Critical");
            }
          }}
        >
          <h2>{stats.critical}</h2>
          <p>Critical</p>
        </article>
      </div>

      <div className="ticket-list-page__toolbar" style={{ gridTemplateColumns: "1fr" }}>
        <div className="ticket-list-page__search-wrap" style={{ maxWidth: "440px" }}>
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
            className={`ticket-list-page__card ${ticket.status === "Open" ? "technician-ticket-card--new" : ""}`}
            onClick={() => handleOpenTicket(ticket.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenTicket(ticket.id);
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="ticket-list-page__ticket-id">{ticket.id}</span>
                    {ticket.status === "Open" ? <span className="technician-ticket-badge">New</span> : null}
                  </div>
                  <h3>{ticket.title}</h3>
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <span className={`ticket-list-page__status ticket-list-page__status--${ticket.status.toLowerCase().replace(" ", "-")}`}>
                  {ticket.status === "Resolved"
                    ? ticket.sentToAdmin
                      ? "Resolved • Sent to Admin"
                      : "Resolved • Not Sent"
                    : ticket.status}
                </span>
                {ticket.status === "Resolved" ? (
                  <button
                    type="button"
                    aria-label="Delete resolved message"
                    onClick={(event) => dismissResolvedMessage(ticket.id, event)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.65rem",
                      height: "1.65rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(255, 101, 101, 0.55)",
                      color: "#ff7878",
                      background: "rgba(95, 23, 23, 0.35)",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                ) : null}
              </div>
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

            {ticket.status === "Resolved" ? (
              <div className="ticket-list-page__details-row" style={{ marginTop: "0.55rem", color: "#b9cdfb" }}>
                <span>Resolution:</span>
                <span>{ticket.resolutionText || "Resolution message not provided."}</span>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {showRecentMaintenance ? (
        <section className="ticket-list-page__card" aria-label="Recent maintenance tickets">
          <div className="ticket-list-page__card-top">
            <h2>Recent Maintenance (In Progress)</h2>
          </div>
          {loading ? (
            <p className="ticket-list-page__empty">Loading recent tickets...</p>
          ) : recentInProgressTickets.length === 0 ? (
            <p className="ticket-list-page__empty">No in-progress maintenance tickets yet.</p>
          ) : (
            <div className="ticket-list-page__details-row" style={{ display: "grid", gap: "0.75rem" }}>
              {recentInProgressTickets.map((ticket) => (
                <button
                  key={`recent-${ticket.id}`}
                  type="button"
                  className="ticket-list-page__status ticket-list-page__status--in-progress"
                  style={{ justifyContent: "space-between", textAlign: "left", width: "100%" }}
                  onClick={() => handleOpenTicket(ticket.id)}
                >
                  <span>{ticket.id} - {ticket.title}</span>
                  <span>{ticket.location} • {ticket.date}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </section>
  );
}