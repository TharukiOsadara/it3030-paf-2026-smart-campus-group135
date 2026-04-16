import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const TECH_ASSIGNMENTS_KEY = "sc_technician_assignments_v1";

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

const resolveTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || "";

const removeAssignedTicket = (ticketId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(TECH_ASSIGNMENTS_KEY) || "{}");
    const next = Object.fromEntries(
      Object.entries(raw).map(([technicianId, ids]) => [
        technicianId,
        (Array.isArray(ids) ? ids : []).filter((id) => id !== ticketId),
      ])
    );
    localStorage.setItem(TECH_ASSIGNMENTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage access issues.
  }
};

export default function TechnicianSolutionPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [solution, setSolution] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!ticketId) return;
      try {
        setLoading(true);
        setError("");
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
      } catch (loadError) {
        setError(loadError.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId]);

  const validateSolution = () => {
    if (!solution.trim()) {
      setError("Please enter the technician solution before submitting.");
      return false;
    }
    return true;
  };

  const submitToAdmin = async () => {
    if (!ticket || !validateSolution()) return;
    try {
      setSaving(true);
      setError("");
      const id = resolveTicketId(ticket);
      await ticketService.addComment(id, { content: `[Technician Solution] ${solution.trim()}` });
      await ticketService.updateStatus(id, {
        status: "IN_PROGRESS",
        resolutionNote: solution.trim(),
      });
      navigate("/dashboard/technician");
    } catch (saveError) {
      setError(saveError.message || "Failed to submit solution to admin");
    } finally {
      setSaving(false);
    }
  };

  const resolveAndClose = async () => {
    if (!ticket || !validateSolution()) return;
    try {
      setSaving(true);
      setError("");
      const id = resolveTicketId(ticket);
      await ticketService.addComment(id, { content: `[Technician Resolution] ${solution.trim()}` });
      await ticketService.updateStatus(id, {
        status: "RESOLVED",
        resolutionNote: solution.trim(),
      });
      removeAssignedTicket(id);
      navigate("/dashboard/technician");
    } catch (saveError) {
      setError(saveError.message || "Failed to close ticket");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="new-ticket-page"><p className="new-ticket-page__error">Loading technician form...</p></section>;
  }

  if (!ticket) {
    return (
      <section className="new-ticket-page">
        <button className="new-ticket-page__back" onClick={() => navigate("/dashboard/technician")} aria-label="Back to technician dashboard">
          <ArrowLeft size={20} />
        </button>
        <p className="new-ticket-page__error">{error || "Ticket not found"}</p>
      </section>
    );
  }

  const readableStatus = normalizeStatus(ticket.status);

  return (
    <section className="new-ticket-page">
      <header className="new-ticket-page__header">
        <button className="new-ticket-page__back" onClick={() => navigate("/dashboard/technician")} aria-label="Back to technician dashboard">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Technician Solution Form</h1>
          <p>Provide diagnosis and resolution details for this assigned ticket</p>
        </div>
      </header>

      <section className="new-ticket-page__card">
        <h2>{ticket.title || "Untitled incident"}</h2>
        <p className="new-ticket-page__card-subtitle">
          {resolveTicketId(ticket)} • {toUiValue(ticket.category) || "General"} • {toUiValue(ticket.priority) || "Medium"} • {readableStatus}
        </p>

        <label>
          Location
          <input value={ticket.location || "Location not provided"} disabled readOnly />
        </label>

        <label>
          Original Description
          <textarea value={ticket.description || "No description provided."} disabled readOnly rows={5} />
        </label>

        <label>
          Technician Solution *
          <textarea
            value={solution}
            onChange={(event) => setSolution(event.target.value)}
            placeholder="Explain root cause, what was fixed, parts/resources used, and recommended follow-up..."
            rows={7}
          />
        </label>
      </section>

      {error ? <p className="new-ticket-page__error">{error}</p> : null}

      <div className="new-ticket-page__actions">
        <button type="button" className="new-ticket-page__btn new-ticket-page__btn--ghost" onClick={() => navigate("/dashboard/technician")} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="new-ticket-page__btn" onClick={submitToAdmin} disabled={saving}>
          {saving ? "Saving..." : "Submit To Admin"}
        </button>
        <button type="button" className="new-ticket-page__btn new-ticket-page__btn--primary" onClick={resolveAndClose} disabled={saving}>
          {saving ? "Saving..." : "Resolve & Close"}
        </button>
      </div>
    </section>
  );
}
