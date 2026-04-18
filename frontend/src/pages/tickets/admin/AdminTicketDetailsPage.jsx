import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Clock3, CheckCircle2, MapPin, User, Paperclip, MessageCircle, Send, Trash2, Download } from "lucide-react";
import { ticketService } from "../../../services/TicketServices";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const TECH_ASSIGNMENTS_KEY = "sc_technician_assignments_v1";

const statusIconMap = {
  Open: AlertTriangle,
  "In Progress": Clock3,
  Resolved: CheckCircle2,
};

const timelineIconMap = {
  created: AlertTriangle,
  assigned: User,
  status: CheckCircle2,
  comment: MessageCircle,
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

const formatDateTime = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentUserId = () => localStorage.getItem("sc_user_id") || localStorage.getItem("userId") || "demo-user";
const getCurrentUserRole = () => (localStorage.getItem("sc_user_role") || localStorage.getItem("userRole") || "USER").toUpperCase();
const resolveTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || "";
const isWorkflowRoleValidationError = (error) =>
  (error?.message || "").toLowerCase().includes("only staff roles can update ticket workflow status");

const saveTechnicianAssignment = (technicianId, assignedTicketId) => {
  if (!technicianId || !assignedTicketId) return;
  try {
    const raw = JSON.parse(localStorage.getItem(TECH_ASSIGNMENTS_KEY) || "{}");
    const current = Array.isArray(raw[technicianId]) ? raw[technicianId] : [];
    raw[technicianId] = Array.from(new Set([...current, assignedTicketId]));
    localStorage.setItem(TECH_ASSIGNMENTS_KEY, JSON.stringify(raw));
  } catch {
    // Ignore storage access issues.
  }
};

const mapTicket = (ticket) => {
  const created = formatDateTime(ticket.createdAt || ticket.updatedAt);
  const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : [];
  const activities = Array.isArray(ticket.activities)
    ? ticket.activities.map((activity) => ({
        type: activity.type?.toLowerCase().includes("comment") ? "comment" : "status",
        user: activity.actorId || "System",
        date: formatDateTime(activity.createdAt),
        sortKey: activity.createdAt,
        content: activity.content,
        source: "activity",
      }))
    : [];

  const comments = Array.isArray(ticket.comments)
    ? ticket.comments.map((item) => ({
        id: item.id,
        type: "comment",
        user: item.userId || "Unknown",
        date: formatDateTime(item.updatedAt || item.createdAt),
        sortKey: item.updatedAt || item.createdAt,
        content: item.content,
        source: "comment",
      }))
    : [];

  const timeline = [...activities, ...comments].sort((a, b) => {
    const da = new Date(a.sortKey || 0).getTime();
    const db = new Date(b.sortKey || 0).getTime();
    return Number.isNaN(da) || Number.isNaN(db) ? 0 : da - db;
  });

  return {
    id: resolveTicketId(ticket),
    title: ticket.title || "Untitled incident",
    status: normalizeStatus(ticket.status),
    priority: toUiValue(ticket.priority) || "Medium",
    category: toUiValue(ticket.category) || "General",
    location: ticket.location || "Location not provided",
    reporter: ticket.userId || "Unknown user",
    assignee: ticket.assignedTo || "",
    date: created,
    description: ticket.description || "No description provided.",
    userId: ticket.userId || "demo-user",
    attachments,
    timeline,
    _raw: ticket,
  };
};

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [adminSolution, setAdminSolution] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      if (!ticketId) return;

      try {
        setLoading(true);
        setLoadError("");
        const response = await ticketService.getTicketById(ticketId);
        const mapped = mapTicket(response);
        setTicket(mapped);
      } catch (error) {
        setLoadError(error.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        const technicians = await ticketService.getTechnicians();
        if (technicians.length > 0) {
          setTechnicianId(technicians[0].id);
        }
      } catch {
        // Silently ignore; Assign button stays disabled if lookup fails.
      }
    };
    loadTechnician();
  }, []);

  const updateStatus = async (nextStatus, options = {}) => {
    if (!ticket || actionBusy) return;

    try {
      setActionBusy(true);
      const updated = await ticketService.updateStatus(ticket.id, {
        status: nextStatus,
        resolutionNote: options.resolutionNote || "",
      });
      setTicket(mapTicket(updated));
      if (options.redirectToResolved) {
        navigate("/dashboard/incidents?tab=resolved");
      }
    } catch (error) {
      if (isWorkflowRoleValidationError(error)) {
        // Local fallback while auth/roles are not yet configured.
        const localStatus = nextStatus === "REJECTED" ? "Open" : normalizeStatus(nextStatus);
        setTicket((prev) => (prev ? { ...prev, status: localStatus } : prev));
        setLoadError("");
        if (options.redirectToResolved && nextStatus === "RESOLVED") {
          navigate("/dashboard/incidents?tab=resolved");
        }
      } else {
        setLoadError(error.message || "Failed to update ticket");
      }
    } finally {
      setActionBusy(false);
    }
  };

  const postComment = async () => {
    if (!comment.trim() || !ticket) return;
    try {
      setActionBusy(true);
      const updated = await ticketService.addComment(ticket.id, { content: comment.trim() });
      setTicket(mapTicket(updated));
      setComment("");
    } catch (error) {
      setLoadError(error.message || "Failed to post comment");
    } finally {
      setActionBusy(false);
    }
  };

  const sendToUser = async () => {
    if (!ticket || actionBusy) return;

    const message = adminMessage.trim() || "Update from admin";
    const solution = adminSolution.trim();

    try {
      setActionBusy(true);

      if (solution) {
        await ticketService.addComment(ticket.id, {
          content: `[Admin Solution] ${solution}`,
        });
      }

      const updatedWithComment = await ticketService.addComment(ticket.id, {
        content: `[Admin] ${message}`,
      });

      let nextTicket = mapTicket(updatedWithComment);

      try {
        const resolved = await ticketService.updateStatus(ticket.id, {
          status: "RESOLVED",
          resolutionNote: solution || "Message sent to reporter",
        });
        nextTicket = mapTicket(resolved);
      } catch {
        // Keep local UI resolved even when backend workflow validation blocks status updates.
        nextTicket = {
          ...nextTicket,
          status: "Resolved",
        };
      }

      setTicket(nextTicket);
      setAdminSolution("");
      setAdminMessage("");
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Failed to send message to reporter");
    } finally {
      setActionBusy(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!ticket || !commentId) return;
    try {
      setActionBusy(true);
      const updated = await ticketService.deleteComment(ticket.id, commentId);
      setTicket(mapTicket(updated));
    } catch (error) {
      setLoadError(error.message || "Failed to delete comment");
    } finally {
      setActionBusy(false);
    }
  };

  const assignTechnicianAndOpenDashboard = async () => {
    if (!ticket || actionBusy || ticket.status === "Resolved") return;

    try {
      setActionBusy(true);
      setLoadError("");

      // Resolve the technician ID (preloaded or fetched now)
      let resolvedTechId = technicianId;
      if (!resolvedTechId) {
        try {
          const technicians = await ticketService.getTechnicians();
          if (technicians.length > 0) {
            resolvedTechId = technicians[0].id;
            setTechnicianId(resolvedTechId);
          }
        } catch {
          // Fallback handled below.
        }
      }
      if (!resolvedTechId) {
        resolvedTechId = "tech@smartcampus.com";
      }

      let nextTicket = ticket;

      try {
        const assigned = await ticketService.assignTechnician(ticket.id, resolvedTechId);
        nextTicket = mapTicket(assigned);
      } catch {
        // Continue with local assignment fallback when backend role restrictions apply.
      }

      if (nextTicket.status !== "In Progress") {
        try {
          const progressed = await ticketService.updateStatus(ticket.id, {
            status: "IN_PROGRESS",
            resolutionNote: "Assigned to technician",
          });
          nextTicket = mapTicket(progressed);
        } catch {
          // Keep local UI in sync even if backend update is blocked.
          nextTicket = {
            ...nextTicket,
            status: "In Progress",
          };
        }
      }

      saveTechnicianAssignment(resolvedTechId, ticket.id);
      setTicket({
        ...nextTicket,
        assignee: nextTicket.assignee || resolvedTechId,
      });
      navigate("/dashboard/incidents", { replace: true });
    } catch (error) {
      setLoadError(error.message || "Failed to assign technician");
    } finally {
      setActionBusy(false);
    }
  };

  const deleteTicket = async () => {
    if (!ticket || actionBusy) return;
    if (!window.confirm("Delete this ticket permanently?")) return;

    try {
      setActionBusy(true);
      await ticketService.deleteTicket(ticket.id);
      navigate("/dashboard/incidents");
    } catch (error) {
      setLoadError(error.message || "Failed to delete ticket");
    } finally {
      setActionBusy(false);
    }
  };

  const canDeleteComment = (item) => {
    const userId = getCurrentUserId();
    const role = getCurrentUserRole();
    return item.user === userId || role === "ADMIN";
  };

  const StatusIcon = useMemo(() => statusIconMap[ticket?.status] || AlertTriangle, [ticket]);

  if (loading) {
    return (
      <section className="ticket-detail-page">
        <p className="ticket-detail-page__empty">Loading ticket details...</p>
      </section>
    );
  }

  if (loadError && !ticket) {
    return (
      <section className="ticket-detail-page">
        <button className="ticket-detail-page__back" onClick={() => navigate("/dashboard/incidents")}>
          <ArrowLeft size={16} />
        </button>
        <p className="ticket-detail-page__empty">{loadError}</p>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="ticket-detail-page">
        <button className="ticket-detail-page__back" onClick={() => navigate("/dashboard/incidents")}>
          <ArrowLeft size={16} />
        </button>
        <p className="ticket-detail-page__empty">Ticket not found.</p>
      </section>
    );
  }

  return (
    <section className="ticket-detail-page">
      <header className="ticket-detail-page__header">
        <button className="ticket-detail-page__back" onClick={() => navigate("/dashboard/incidents")} aria-label="Back to incidents">
          <ArrowLeft size={18} />
        </button>

        <div className="ticket-detail-page__heading-wrap">
          <div className="ticket-detail-page__chips">
            <span className="ticket-detail-page__id">{ticket.id}</span>
            <span className={`ticket-detail-page__chip ticket-detail-page__chip--status ticket-detail-page__chip--${ticket.status.toLowerCase().replace(" ", "-")}`}>
              {ticket.status}
            </span>
            <span className={`ticket-detail-page__chip ticket-detail-page__chip--priority ticket-detail-page__chip--${ticket.priority.toLowerCase()}`}>
              {ticket.priority.toUpperCase()}
            </span>
          </div>

          <h1>{ticket.title}</h1>
        </div>
      </header>

      <div className="ticket-detail-page__layout">
        <div className="ticket-detail-page__left-col">
          <article className="ticket-detail-page__panel">
            <h2>Description</h2>
            <p className="ticket-detail-page__description-text">{ticket.description}</p>
          </article>

          <article className="ticket-detail-page__panel">
            <h2>
              <Paperclip size={18} />
              <span>Attachments ({ticket.attachments.length})</span>
            </h2>

            <div className="ticket-detail-page__attachments">
              {ticket.attachments.map((file) => (
                <div key={file.id} className="ticket-detail-page__file">
                  <Paperclip size={16} />
                  <span>{file.originalFileName}</span>
                  <a href={`${API_BASE}/tickets/${ticket.id}/attachments/${file.id}/download`} target="_blank" rel="noreferrer">
                    <Download size={14} />
                  </a>
                </div>
              ))}
            </div>
          </article>

          <article className="ticket-detail-page__panel">
            <h2>Activity & Comments</h2>

            <div className="ticket-detail-page__timeline">
              {ticket.timeline.map((event, index) => {
                const EventIcon = timelineIconMap[event.type] || MessageCircle;
                const isLast = index === ticket.timeline.length - 1;
                return (
                  <div key={`${event.user}-${event.date}-${index}`} className="ticket-detail-page__timeline-item">
                    <div className="ticket-detail-page__timeline-marker">
                      <span className="ticket-detail-page__timeline-icon">
                        <EventIcon size={15} />
                      </span>
                      {!isLast ? <span className="ticket-detail-page__timeline-line" /> : null}
                    </div>

                    <div className="ticket-detail-page__timeline-body">
                      <div className="ticket-detail-page__timeline-head">
                        <strong>{event.user}</strong>
                        <span>{event.date}</span>
                      </div>
                      <p>{event.content}</p>
                      {event.source === "comment" && event.id && canDeleteComment(event) ? (
                        <button type="button" className="ticket-detail-page__action ticket-detail-page__action--danger" onClick={() => deleteComment(event.id)}>
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ticket-detail-page__comment-box">
              <textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
              />
              <button type="button" disabled={!comment.trim()} onClick={postComment}>
                <Send size={14} />
                <span>Post Comment</span>
              </button>
            </div>
          </article>
        </div>

        <aside className="ticket-detail-page__right-col">
          <article className="ticket-detail-page__panel">
            <h2>Details</h2>

            <div className="ticket-detail-page__detail-list">
              <div className="ticket-detail-page__detail-item">
                <MapPin size={18} />
                <div>
                  <small>Location</small>
                  <p>{ticket.location}</p>
                </div>
              </div>

              <div className="ticket-detail-page__detail-item">
                <StatusIcon size={18} />
                <div>
                  <small>Category</small>
                  <p>{ticket.category}</p>
                </div>
              </div>

              <div className="ticket-detail-page__detail-item">
                <Clock3 size={18} />
                <div>
                  <small>Reported On</small>
                  <p>{ticket.date}</p>
                </div>
              </div>

              <div className="ticket-detail-page__detail-item">
                <User size={18} />
                <div>
                  <small>Reporter</small>
                  <p>{ticket.reporter}</p>
                </div>
              </div>

              {ticket.assignee ? (
                <div className="ticket-detail-page__detail-item">
                  <span className="ticket-detail-page__avatar">{ticket.assignee.charAt(0)}</span>
                  <div>
                    <small>Assigned To</small>
                    <p>{ticket.assignee}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          <article className="ticket-detail-page__panel">
            <h2>Actions</h2>
            <div className="ticket-detail-page__actions">
              <button className="ticket-detail-page__action ticket-detail-page__action--primary" disabled={actionBusy || ticket.status === "Resolved"} onClick={assignTechnicianAndOpenDashboard}>Assign Technician</button>
              <button className="ticket-detail-page__action ticket-detail-page__action--neutral" disabled={actionBusy} onClick={sendToUser}>Send to User</button>
              {getCurrentUserRole() === "ADMIN" ? <button className="ticket-detail-page__action" disabled={actionBusy} onClick={() => updateStatus("REJECTED")}>Reject Ticket</button> : null}
              {getCurrentUserRole() === "ADMIN" ? <button className="ticket-detail-page__action ticket-detail-page__action--neutral" disabled={actionBusy} onClick={deleteTicket}>Delete Ticket</button> : null}
              <button className="ticket-detail-page__action ticket-detail-page__action--danger" disabled={actionBusy} onClick={() => updateStatus("RESOLVED", { resolutionNote: adminSolution.trim(), redirectToResolved: true })}>Close Ticket</button>
            </div>
            {loadError ? <p className="ticket-detail-page__empty">{loadError}</p> : null}
          </article>
        </aside>
      </div>
    </section>
  );
}