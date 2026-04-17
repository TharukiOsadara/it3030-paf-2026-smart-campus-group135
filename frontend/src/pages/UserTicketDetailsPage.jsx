import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock3, MessageSquare } from "lucide-react";
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

const resolveTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || "";

const mapTicket = (ticket) => {
  const activities = Array.isArray(ticket.activities) ? ticket.activities : [];
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];
  const adminResponses = [
    ...activities
      .filter((item) => ["ADMIN", "STAFF", "TECHNICIAN"].includes((item.actorRole || "").toUpperCase()))
      .map((item) => ({
        id: item.id,
        author: item.actorId || "Admin",
        content: item.content,
        at: item.createdAt,
        type: "activity",
      })),
    ...comments
      .filter((item) => ["ADMIN", "STAFF", "TECHNICIAN"].includes((item.userRole || "").toUpperCase()))
      .map((item) => ({
        id: item.id,
        author: item.userId || "Admin",
        content: item.content,
        at: item.updatedAt || item.createdAt,
        type: "comment",
      })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return {
    id: resolveTicketId(ticket),
    title: ticket.title || "Untitled incident",
    description: ticket.description || "No description provided.",
    status: normalizeStatus(ticket.status),
    priority: toUiValue(ticket.priority) || "Medium",
    category: toUiValue(ticket.category) || "General",
    location: ticket.location || "Location not provided",
    createdAt: formatDateTime(ticket.createdAt || ticket.updatedAt),
    adminResponses,
  };
};

const statusIconMap = {
  Open: AlertTriangle,
  "In Progress": Clock3,
  Resolved: CheckCircle2,
};

export default function UserTicketDetailsPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!ticketId) return;
      try {
        setLoading(true);
        setError("");
        const response = await ticketService.getTicketById(ticketId);
        setTicket(mapTicket(response));
      } catch (loadError) {
        setError(loadError.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId]);

  const StatusIcon = useMemo(() => statusIconMap[ticket?.status] || AlertTriangle, [ticket]);

  if (loading) {
    return <section className="user-ticket-detail"><p className="user-ticket-detail__empty">Loading ticket...</p></section>;
  }

  if (!ticket) {
    return (
      <section className="user-ticket-detail">
        <button className="user-ticket-detail__back" onClick={() => navigate("/dashboard/my-tickets")}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <p className="user-ticket-detail__empty">{error || "Ticket not found"}</p>
      </section>
    );
  }

  const solved = ticket.status === "Resolved";

  return (
    <section className="user-ticket-detail">
      <header className="user-ticket-detail__header">
        <button className="user-ticket-detail__back" onClick={() => navigate("/dashboard/my-tickets")}>
          <ArrowLeft size={16} />
          <span>Back to My Tickets</span>
        </button>
      </header>

      <article className="user-ticket-detail__card">
        <div className="user-ticket-detail__title-row">
          <div>
            <span className="user-ticket-detail__id">{ticket.id}</span>
            <h1>{ticket.title}</h1>
          </div>
          <span className={`user-ticket-detail__status ${solved ? "user-ticket-detail__status--solved" : "user-ticket-detail__status--pending"}`}>
            {solved ? "Solved" : "Pending"}
          </span>
        </div>

        <div className="user-ticket-detail__summary">
          <div><small>Status</small><p><StatusIcon size={15} /> {ticket.status}</p></div>
          <div><small>Priority</small><p>{ticket.priority}</p></div>
          <div><small>Category</small><p>{ticket.category}</p></div>
          <div><small>Reported On</small><p>{ticket.createdAt}</p></div>
          <div><small>Location</small><p>{ticket.location}</p></div>
        </div>

        <div className="user-ticket-detail__section">
          <h2>Description</h2>
          <p>{ticket.description}</p>
        </div>

        <div className="user-ticket-detail__section">
          <h2>Admin Responses</h2>
          {ticket.adminResponses.length === 0 ? <p className="user-ticket-detail__empty">No admin response yet.</p> : null}
          <div className="user-ticket-detail__timeline">
            {ticket.adminResponses.map((entry) => (
              <article key={`${entry.type}-${entry.id}`} className="user-ticket-detail__response">
                <div className="user-ticket-detail__response-head">
                  <span><MessageSquare size={14} /> {entry.author}</span>
                  <small>{formatDateTime(entry.at)}</small>
                </div>
                <p>{entry.content}</p>
              </article>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
