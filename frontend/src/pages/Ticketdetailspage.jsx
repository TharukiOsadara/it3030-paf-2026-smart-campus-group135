import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Clock3, CheckCircle2, MapPin, User, Paperclip, MessageCircle, Send, Trash2, Download } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
    id: ticket.id,
    title: ticket.title || "Untitled incident",
    status: toUiValue(ticket.status) || "Open",
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
        setTicket(mapTicket(response));
      } catch (error) {
        setLoadError(error.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  const updateStatus = async (nextStatus) => {
    if (!ticket || actionBusy) return;

    try {
      setActionBusy(true);
      const note = (nextStatus === "RESOLVED" || nextStatus === "REJECTED")
        ? window.prompt(nextStatus === "RESOLVED" ? "Enter resolution note" : "Enter rejection reason") || ""
        : "";

      const updated = await ticketService.updateStatus(ticket.id, {
        status: nextStatus,
        resolutionNote: note,
      });
      setTicket(mapTicket(updated));
    } catch (error) {
      setLoadError(error.message || "Failed to update ticket");
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
              {ticket.status === "In Progress" ? <button className="ticket-detail-page__action ticket-detail-page__action--success" disabled={actionBusy} onClick={() => updateStatus("RESOLVED")}>Mark Resolved</button> : null}
              <button className="ticket-detail-page__action" disabled={actionBusy} onClick={() => updateStatus("IN_PROGRESS")}>Escalate</button>
              {getCurrentUserRole() === "ADMIN" ? <button className="ticket-detail-page__action" disabled={actionBusy} onClick={() => updateStatus("REJECTED")}>Reject Ticket</button> : null}
              <button className="ticket-detail-page__action ticket-detail-page__action--danger" disabled={actionBusy} onClick={() => updateStatus("CLOSED")}>Close Ticket</button>
            </div>
            {loadError ? <p className="ticket-detail-page__empty">{loadError}</p> : null}
          </article>
        </aside>
      </div>
    </section>
  );
}
