import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ticketService } from "../services/TicketServices";
import { InlineLoader } from "../components/PageShell";
import "./TicketDetailPage.css";

const STATUS_FLOW = ["OPEN","IN_PROGRESS","RESOLVED","CLOSED"];

function statusColor(s) {
  return { OPEN:"badge-open", IN_PROGRESS:"badge-in-progress", RESOLVED:"badge-resolved", CLOSED:"badge-closed", REJECTED:"badge-rejected" }[s] || "badge-closed";
}
function priorityColor(p) {
  return { LOW:"var(--priority-low)", MEDIUM:"var(--priority-medium)", HIGH:"var(--priority-high)", CRITICAL:"var(--priority-critical)" }[p] || "var(--priority-medium)";
}
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [comment, setComment]     = useState("");
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [lightbox, setLightbox]   = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText]   = useState("");
  const commentRef = useRef(null);
  const justCreated = location.state?.created;

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
    } catch {
      // Use mock data for display
      setTicket(MOCK_TICKET);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) { setCommentError("Comment cannot be empty."); return; }
    if (comment.trim().length < 5) { setCommentError("Comment must be at least 5 characters."); return; }
    setCommentError("");
    setSubmittingComment(true);
    try {
      const updated = await ticketService.addComment(id, { content: comment.trim() });
      setTicket(updated);
      setComment("");
    } catch {
      setCommentError("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const updated = await ticketService.deleteComment(id, commentId);
      setTicket(updated);
    } catch { /* handle */ }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const updated = await ticketService.updateComment(id, commentId, { content: editText.trim() });
      setTicket(updated);
      setEditingComment(null);
    } catch { /* handle */ }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const updated = await ticketService.updateStatus(id, { status: newStatus, resolutionNote });
      setTicket(updated);
      setStatusModal(false);
      setNewStatus("");
      setResolutionNote("");
    } catch { /* handle */ }
    finally { setUpdatingStatus(false); }
  };

  if (loading) return (
    <div className="ticket-detail-loading page-wrapper">
      <InlineLoader size={48} />
    </div>
  );

  if (!ticket) return (
    <div className="ticket-detail-notfound page-wrapper">
      <h2>Ticket not found</h2>
      <button className="btn btn-primary" onClick={() => navigate("/tickets")}>Back to Tickets</button>
    </div>
  );

  const statusIdx = STATUS_FLOW.indexOf(ticket.status);

  return (
    <div className="ticket-detail-page page-wrapper">
      {/* SUCCESS TOAST */}
      {justCreated && (
        <div className="ticket-created-toast animate-fadeInUp">
          ✅ Ticket submitted successfully! You'll receive updates here.
        </div>
      )}

      {/* HEADER */}
      <div className="ticket-detail-header">
        <div className="ticket-detail-header__inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/tickets")}>
            ← All Tickets
          </button>
          <div className="ticket-detail-header__main">
            <div className="ticket-detail-header__top">
              <span className="ticket-detail-id">#{ticket.ticketNumber || id.slice(-8).toUpperCase()}</span>
              <div className="ticket-detail-header__badges">
                <span className={`badge ${statusColor(ticket.status)}`}>● {ticket.status?.replace("_"," ")}</span>
                <span className={`badge badge-${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span>
                <span className="badge" style={{background:"rgba(90,200,250,0.1)",color:"var(--color-info)",border:"1px solid rgba(90,200,250,0.2)"}}>
                  {ticket.category?.replace("_"," ")}
                </span>
              </div>
            </div>
            <h1 className="ticket-detail-title">{ticket.title}</h1>
          </div>
          {/* Admin: Status update button */}
          <button className="btn btn-warn btn-sm" onClick={() => setStatusModal(true)}>
            Update Status
          </button>
        </div>
      </div>

      <div className="ticket-detail-body">
        {/* LEFT COLUMN */}
        <div className="ticket-detail-main">
          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section__title">Description</h3>
            <p className="detail-description">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section__title">
                Attachments <span className="detail-section__count">{ticket.attachments.length}</span>
              </h3>
              <div className="attachment-grid">
                {ticket.attachments.map((a, i) => (
                  <div key={i} className="attachment-thumb" onClick={() => setLightbox(a.url || a)}>
                    <img src={a.url || a} alt={`attachment-${i+1}`} />
                    <div className="attachment-thumb__overlay">
                      <span>🔍 View</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Note */}
          {ticket.resolutionNote && (
            <div className="detail-section resolution-section">
              <h3 className="detail-section__title">✅ Resolution Notes</h3>
              <div className="resolution-note">
                <p>{ticket.resolutionNote}</p>
                {ticket.resolvedAt && <p className="resolution-note__date">Resolved: {formatDate(ticket.resolvedAt)}</p>}
              </div>
            </div>
          )}

          {/* COMMENTS */}
          <div className="detail-section comments-section" ref={commentRef}>
            <h3 className="detail-section__title">
              Comments <span className="detail-section__count">{ticket.comments?.length || 0}</span>
            </h3>

            {/* Comment List */}
            <div className="comments-list">
              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="comments-empty">No comments yet. Be the first to add one.</p>
              )}
              {ticket.comments?.map((c, i) => (
                <div key={c.id || i} className="comment-item">
                  <div className="comment-item__avatar">{c.authorName?.[0] || "U"}</div>
                  <div className="comment-item__body">
                    <div className="comment-item__header">
                      <span className="comment-item__author">{c.authorName || "User"}</span>
                      {c.isStaff && <span className="comment-item__staff-tag">Staff</span>}
                      <span className="comment-item__date">{formatDate(c.createdAt)}</span>
                      {c.edited && <span className="comment-item__edited">(edited)</span>}
                    </div>
                    {editingComment === c.id ? (
                      <div className="comment-edit">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={3}
                          maxLength={500}
                          style={{ resize: "vertical" }}
                        />
                        <div className="comment-edit__actions">
                          <button className="btn btn-primary btn-sm" onClick={() => handleEditComment(c.id)}>Save</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingComment(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-item__text">{c.content}</p>
                    )}
                    <div className="comment-item__actions">
                      <button className="comment-action" onClick={() => { setEditingComment(c.id); setEditText(c.content); }}>Edit</button>
                      <button className="comment-action comment-action--danger" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Comment */}
            <div className="new-comment">
              <div className="new-comment__avatar">U</div>
              <div className="new-comment__input-wrap">
                <textarea
                  placeholder="Add a comment..."
                  rows={3}
                  value={comment}
                  onChange={e => { setComment(e.target.value); setCommentError(""); }}
                  className={commentError ? "error" : ""}
                  maxLength={500}
                  style={{ resize: "vertical" }}
                />
                {commentError && <p className="form-error">⚠ {commentError}</p>}
                <div className="new-comment__footer">
                  <span className="form-hint">{500 - comment.length} chars left</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddComment}
                    disabled={submittingComment}
                  >
                    {submittingComment ? <><span className="contact-spinner" /> Posting...</> : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="ticket-detail-sidebar">
          {/* Status Timeline */}
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Status Progress</h3>
            <div className="status-timeline">
              {STATUS_FLOW.map((s, i) => {
                const done = statusIdx > i;
                const active = statusIdx === i;
                const rejected = ticket.status === "REJECTED";
                return (
                  <div key={s} className="status-step">
                    <div className={`status-step__dot ${active ? "status-step__dot--active" : ""} ${done ? "status-step__dot--done" : ""} ${rejected && s === "OPEN" ? "status-step__dot--rejected" : ""}`}>
                      {done ? "✓" : active ? "●" : i + 1}
                    </div>
                    <div className="status-step__info">
                      <span className="status-step__label">{s.replace("_"," ")}</span>
                      {active && <span className="status-step__current">Current</span>}
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`status-step__line ${done ? "status-step__line--done" : ""}`} />
                    )}
                  </div>
                );
              })}
              {ticket.status === "REJECTED" && (
                <div className="status-step">
                  <div className="status-step__dot status-step__dot--rejected">✕</div>
                  <div className="status-step__info">
                    <span className="status-step__label">REJECTED</span>
                    <span className="status-step__current" style={{color:"var(--color-danger)"}}>Final</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Details</h3>
            <div className="sidebar-info">
              {[
                ["Location", ticket.location],
                ["Reported by", ticket.reportedBy],
                ["Created", formatDate(ticket.createdAt)],
                ["Last updated", formatDate(ticket.updatedAt)],
                ["Contact", ticket.contactName],
                ["Phone", ticket.contactPhone || "-"],
                ["Email", ticket.contactEmail || "-"],
              ].map(([k, v]) => v && (
                <div key={k} className="sidebar-info__row">
                  <span className="sidebar-info__key">{k}</span>
                  <span className="sidebar-info__val">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Technician */}
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Assigned Technician</h3>
            {ticket.assignedTo ? (
              <div className="technician-card">
                <div className="technician-card__avatar">{ticket.assignedTo[0]}</div>
                <div>
                  <p className="technician-card__name">{ticket.assignedTo}</p>
                  <p className="technician-card__role">Maintenance Technician</p>
                </div>
              </div>
            ) : (
              <p className="sidebar-empty">Not yet assigned</p>
            )}
          </div>

          {/* Priority */}
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Priority</h3>
            <div className="priority-display" style={{ "--pd-color": priorityColor(ticket.priority) }}>
              <div className="priority-display__dot" />
              <span className="priority-display__label">{ticket.priority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS MODAL */}
      {statusModal && (
        <div className="modal-backdrop" onClick={() => setStatusModal(false)}>
          <div className="modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Update Ticket Status</h3>
              <button className="modal__close" onClick={() => setStatusModal(false)}>×</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="">Select status...</option>
                  {["OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"].map(s => (
                    <option key={s} value={s}>{s.replace("_"," ")}</option>
                  ))}
                </select>
              </div>
              {(newStatus === "RESOLVED" || newStatus === "REJECTED" || newStatus === "CLOSED") && (
                <div className="form-group" style={{marginTop:var_space_md}}>
                  <label className="form-label">
                    {newStatus === "REJECTED" ? "Rejection Reason" : "Resolution Notes"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details..."
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn-ghost" onClick={() => setStatusModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={!newStatus || updatingStatus}
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="attachment" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

const var_space_md = "var(--space-md)";

const MOCK_TICKET = {
  id: "1", ticketNumber: "TK-001",
  title: "Projector not working in Lab A-302",
  description: "The projector in Laboratory A-302 has completely stopped working since Monday morning. Students cannot view lecture slides during sessions. The device shows a red blinking LED on power-up but the image never displays on screen. We have already tried replacing the HDMI cable and restarting the laptop, but the issue persists.",
  status: "IN_PROGRESS", priority: "HIGH", category: "IT_EQUIPMENT",
  location: "Block A, Room 302", reportedBy: "Kasun Perera",
  contactName: "Kasun Perera", contactEmail: "kasun@sliit.lk", contactPhone: "+94 77 123 4567",
  createdAt: "2026-04-08T09:00:00", updatedAt: "2026-04-09T14:00:00",
  assignedTo: "Ashan Kumara",
  attachments: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=300&fit=crop",
  ],
  resolutionNote: null,
  comments: [
    { id:"c1", authorName:"Ashan Kumara", isStaff:true, content:"I've been assigned to this ticket. Will visit the lab tomorrow morning to diagnose the issue.", createdAt:"2026-04-08T11:00:00", edited:false },
    { id:"c2", authorName:"Kasun Perera", isStaff:false, content:"Thank you. Please note that Lab A-302 is occupied from 8-10 AM tomorrow.", createdAt:"2026-04-08T12:30:00", edited:false },
  ]
};