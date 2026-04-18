import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Search, Filter, ChevronDown, AlertTriangle, Clock3, CheckCircle2, ArrowRight } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const USER_OPENED_KEY = "sc_user_opened_tickets_v1";
const USER_COMPLETED_KEY = "sc_user_completed_tickets_v1";

const getCurrentUserId = () =>
  localStorage.getItem("sc_user_id") ||
  localStorage.getItem("userId") ||
  "demo-user";

const readUserTicketIds = (storageKey, userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const list = Array.isArray(parsed[userId]) ? parsed[userId] : [];
    return Array.from(new Set(list.filter(Boolean)));
  } catch {
    return [];
  }
};

const saveUserTicketId = (storageKey, userId, ticketId) => {
  if (!userId || !ticketId) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const list = Array.isArray(parsed[userId]) ? parsed[userId] : [];
    parsed[userId] = Array.from(new Set([...list, ticketId]));
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch {
    // Ignore localStorage access issues.
  }
};

const extractTaggedMessage = (items, tag) => {
  if (!Array.isArray(items)) return "";
  const tagged = items.filter((item) => (item?.content || "").startsWith(tag)).at(-1);
  return tagged ? (tagged.content || "").replace(tag, "").trim() : "";
};

const extractLatestSolutionInfo = (items) => {
  if (!Array.isArray(items)) return { source: "Unknown", text: "" };

  const latest = [...items]
    .filter((item) => {
      const content = (item?.content || "").toString();
      return (
        content.startsWith("[Admin Solution]") ||
        content.startsWith("[Technician Solution]") ||
        content.startsWith("[Technician Resolution]")
      );
    })
    .at(-1);

  if (!latest) return { source: "Unknown", text: "" };

  const raw = (latest.content || "").toString();
  if (raw.startsWith("[Admin Solution]")) {
    return { source: "Admin", text: raw.replace("[Admin Solution]", "").trim() };
  }
  return {
    source: "Technician",
    text: raw.replace("[Technician Resolution]", "").replace("[Technician Solution]", "").trim(),
  };
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

const getAdminReplyCount = (ticket) => {
  const activities = Array.isArray(ticket.activities) ? ticket.activities : [];
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];

  const isAdminTagged = (value) => (value || "").toString().trim().toLowerCase().startsWith("[admin]");
  const isAdminLikeUser = (value) => (value || "").toString().toLowerCase().includes("admin");

  const activityReplies = activities.filter((item) =>
    ["ADMIN", "STAFF"].includes((item.actorRole || "").toUpperCase()) ||
    isAdminLikeUser(item.actorId) ||
    isAdminTagged(item.content)
  ).length;

  const commentReplies = comments.filter((item) =>
    ["ADMIN", "STAFF"].includes((item.userRole || "").toUpperCase()) ||
    isAdminLikeUser(item.userId) ||
    isAdminTagged(item.content)
  ).length;

  return activityReplies + commentReplies;
};

const mapTicket = (ticket) => {
  const latestSolution = extractLatestSolutionInfo(ticket.comments);
  return {
    id: resolveTicketId(ticket),
    title: ticket.title || "Untitled incident",
    category: toUiValue(ticket.category) || "General",
    priority: toUiValue(ticket.priority) || "Medium",
    status: normalizeStatus(ticket.status),
    date: formatDate(ticket.createdAt || ticket.updatedAt),
    location: ticket.location || "Location not provided",
    responses: getAdminReplyCount(ticket),
    description: ticket.description || "No description provided.",
    adminReply: extractTaggedMessage(ticket.comments, "[Admin]"),
    adminSolution: extractTaggedMessage(ticket.comments, "[Admin Solution]"),
    technicianSolution: extractTaggedMessage(ticket.comments, "[Technician Solution]"),
    technicianResolution: extractTaggedMessage(ticket.comments, "[Technician Resolution]"),
    latestSolutionSource: latestSolution.source,
    latestSolutionText: latestSolution.text,
  };
};

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
  const [searchParams] = useSearchParams();
  const statusSelectRef = useRef(null);
  const currentUserId = getCurrentUserId();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(() => {
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    if (tabParam === "pending") return "Pending";
    if (tabParam === "resolved") return "Solved";
    if (tabParam === "admin-replies" || tabParam === "adminreplies") return "Admin Replies";
    return "All";
  });
  const [openedTicketIds, setOpenedTicketIds] = useState(() => readUserTicketIds(USER_OPENED_KEY, currentUserId));
  const [completedTicketIds, setCompletedTicketIds] = useState(() => readUserTicketIds(USER_COMPLETED_KEY, currentUserId));

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

  useEffect(() => {
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    if (tabParam === "pending") {
      setTab("Pending");
      return;
    }
    if (tabParam === "resolved") {
      setTab("Solved");
      return;
    }
    if (tabParam === "admin-replies" || tabParam === "adminreplies") {
      setTab("Admin Replies");
      return;
    }
    if (tabParam === "total" || tabParam === "all") {
      setTab("All");
    }
  }, [searchParams]);

  const ticketsWithWorkflow = useMemo(() => {
    return tickets.map((ticket) => {
      const hasAdminReply = Boolean(ticket.adminReply);
      const hasAdminOrTechSolution = Boolean(ticket.adminSolution || ticket.technicianResolution || ticket.technicianSolution);
      const backendResolved = ticket.status === "Resolved" || hasAdminOrTechSolution;
      const completedByUser = completedTicketIds.includes(ticket.id);
      const completed = completedByUser || (backendResolved && !hasAdminReply);
      const opened = completed || openedTicketIds.includes(ticket.id);

      let bucket = "total";
      if (completed) {
        bucket = "resolved";
      } else if (hasAdminReply) {
        bucket = "adminReplies";
      } else if (opened) {
        bucket = "pending";
      }

      const source = ticket.latestSolutionSource || (ticket.adminReply ? "Admin" : "Unknown");
      const solutionText =
        ticket.latestSolutionText ||
        ticket.adminSolution ||
        ticket.technicianResolution ||
        ticket.technicianSolution ||
        "No solution text yet.";
      return {
        ...ticket,
        completed,
        bucket,
        source,
        solutionText,
      };
    });
  }, [tickets, openedTicketIds, completedTicketIds]);

  const stats = useMemo(() => {
    return {
      total: ticketsWithWorkflow.filter((ticket) => ticket.bucket === "total").length,
      pending: ticketsWithWorkflow.filter((ticket) => ticket.bucket === "pending").length,
      solved: ticketsWithWorkflow.filter((ticket) => ticket.bucket === "resolved").length,
      responses: ticketsWithWorkflow.filter((ticket) => ticket.bucket === "adminReplies").length,
    };
  }, [ticketsWithWorkflow]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    const statusFilter = normalizeDashboardStatus(tab);
    return ticketsWithWorkflow.filter((ticket) => {
      const matchesSearch =
        !value ||
        ticket.title.toLowerCase().includes(value) ||
        ticket.id.toLowerCase().includes(value);

      const matchesStatus =
        (statusFilter === "All Status" && ticket.bucket === "total") ||
        (statusFilter === "Admin Replies" && ticket.bucket === "adminReplies") ||
        (statusFilter === "Pending" && ticket.bucket === "pending") ||
        (statusFilter === "Resolved" && ticket.bucket === "resolved");

      return matchesSearch && matchesStatus;
    });
  }, [ticketsWithWorkflow, search, tab]);

  const handleOpenUserTicket = (ticket) => {
    if (!ticket?.id) return;
    if (ticket.bucket === "total") {
      saveUserTicketId(USER_OPENED_KEY, currentUserId, ticket.id);
      setOpenedTicketIds((prev) => (prev.includes(ticket.id) ? prev : [...prev, ticket.id]));
    }
    if (ticket.bucket === "adminReplies") {
      saveUserTicketId(USER_COMPLETED_KEY, currentUserId, ticket.id);
      setCompletedTicketIds((prev) => (prev.includes(ticket.id) ? prev : [...prev, ticket.id]));
    }
    navigate(`/dashboard/my-tickets/${ticket.id}`);
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

  const tabAsFilterValue = normalizeDashboardStatus(tab);

  return (
    <section className="ticket-list-page">
      <header className="ticket-list-page__header" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
        </div>

        <button className="ticket-list-page__add-btn" onClick={() => navigate("/dashboard/incidents/new")}>
          <Plus size={16} />
          <span>New Ticket</span>
        </button>
      </header>

      <div className="ticket-list-page__stats">
        <article
          className={`ticket-list-page__stat-card ticket-list-page__stat-card--total ${tab === "All" ? "ticket-list-page__stat-card--active" : ""}`}
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
          const solved = ticket.bucket === "resolved";
          const pending = ticket.bucket === "pending";
          const hasAdminReply = ticket.bucket === "adminReplies";
          const technicianReplyText = ticket.technicianResolution || ticket.technicianSolution;
          const latestReplyLabel = ticket.adminReply
            ? "Latest Admin Reply"
            : (technicianReplyText ? "Latest Technician Reply" : "Latest Reply");
          const latestReplyText = ticket.adminReply || technicianReplyText || "No reply message yet.";
          const stageClass =
            ticket.bucket === "resolved"
              ? "ticket-list-page__tag--stage-resolved"
              : ticket.bucket === "adminReplies"
                ? "ticket-list-page__tag--stage-adminReplies"
                : ticket.bucket === "pending"
                  ? "ticket-list-page__tag--stage-pending"
                  : "ticket-list-page__tag--stage-total";
          const isNew = ticket.bucket === "total";
          const statusLabel = solved ? "Solved" : (hasAdminReply ? "Admin Reply" : (pending ? "Pending" : "New"));
          const statusClass = solved
            ? "ticket-list-page__status--resolved"
            : (hasAdminReply
              ? "ticket-list-page__status--in-progress"
              : "ticket-list-page__status--open");

          return (
            <article
              key={ticket.id}
              className={`ticket-list-page__card ticket-list-page__card--${ticket.bucket}`}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenUserTicket(ticket)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenUserTicket(ticket);
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
                    {hasAdminReply ? <span className="ticket-list-page__unread-badge">Unread Admin Reply</span> : null}
                    <h3>{ticket.title}</h3>
                  </div>
                </div>
                {isNew ? (
                  <span className="ticket-list-page__tag ticket-list-page__tag--new">New</span>
                ) : (
                  <span className={`ticket-list-page__status ${statusClass}`}>
                    {statusLabel}
                  </span>
                )}
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

              {(ticket.bucket === "adminReplies" || ticket.bucket === "resolved") ? (
                <div className="ticket-list-page__details-row" style={{ marginTop: "0.55rem", color: "#b9cdfb", display: "grid", gap: "0.35rem" }}>
                  <span><strong>User Ticket:</strong> {ticket.description}</span>
                  <span><strong>{latestReplyLabel}:</strong> {latestReplyText}</span>
                  <span><strong>Solution Source:</strong> {ticket.source}</span>
                  <span><strong>Solution:</strong> {ticket.solutionText} {ticket.source !== "Unknown" ? `(Provided by ${ticket.source})` : ""}</span>
                </div>
              ) : null}

              <span className="ticket-list-page__arrow"><ArrowRight size={16} /></span>
            </article>
          );
        })}
      </div>
    </section>
  );
}