import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { ticketService } from "../services/TicketServices";

const initialForm = {
  title: "",
  category: "",
  priority: "",
  location: "",
  description: "",
  email: "",
  phone: "",
};

const resolveTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || "";
const normalizePhoneDigits = (value) => value.replace(/\D/g, "").slice(0, 10);

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const getCurrentUserId = () => {
    return (
      localStorage.getItem("sc_user_id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      "demo-user"
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    if (name === "phone") {
      setFormData((current) => ({ ...current, phone: normalizePhoneDigits(value) }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const allowed = selectedFiles.slice(0, Math.max(0, 3 - files.length));
    if (allowed.length > 0) {
      setFiles((current) => [...current, ...allowed]);
    }
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title || !formData.category || !formData.priority || !formData.location || !formData.description) {
      setError("Please fill all required fields.");
      return;
    }

    const email = formData.email.trim();
    const phoneDigits = normalizePhoneDigits(formData.phone);

    if (email && !email.includes("@")) {
      setError("Please enter a valid email address with '@'.");
      return;
    }

    if (phoneDigits && phoneDigits.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const contactDetails = [email, phoneDigits].filter(Boolean).join(" | ");

      const created = await ticketService.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        priority: formData.priority.trim().toUpperCase(),
        contactDetails,
        userId: getCurrentUserId(),
        resourceId: null,
        location: formData.location.trim(),
        status: "OPEN",
        assignedTo: null,
        resolutionNotes: null,
      });

      const createdTicketId = resolveTicketId(created);

      for (const file of files) {
        if (!createdTicketId) break;
        try {
          await ticketService.addAttachment(createdTicketId, file);
        } catch {
          // Keep navigation flow smooth even if one attachment fails.
        }
      }

      navigate("/dashboard/my-tickets");
    } catch (submitError) {
      setError(submitError.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="new-ticket-page">
      <header className="new-ticket-page__header">
        <button className="new-ticket-page__back" onClick={() => navigate("/dashboard/incidents")} aria-label="Back to incidents">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Create New Ticket</h1>
          <p>Report a maintenance issue or facility problem</p>
        </div>
      </header>

      <form className="new-ticket-page__form" onSubmit={handleSubmit}>
        <section className="new-ticket-page__card">
          <h2>Issue Details</h2>
          <p className="new-ticket-page__card-subtitle">Describe the problem you're reporting</p>

          <label>
            Title *
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Brief summary of the issue" />
          </label>

          <div className="new-ticket-page__grid">
            <label>
              Category *
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                <option value="Equipment">Equipment</option>
                <option value="HVAC">HVAC</option>
                <option value="Furniture">Furniture</option>
                <option value="Network">Network</option>
                <option value="Plumbing">Plumbing</option>
              </select>
            </label>

            <label>
              Priority *
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
          </div>

          <label>
            Location / Resource *
            <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Block A, Floor 2, Room 201" />
          </label>

          <label>
            Description *
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows={6}
            />
          </label>
        </section>

        <section className="new-ticket-page__card">
          <h2>Attachments</h2>
          <p className="new-ticket-page__card-subtitle">Upload up to 3 images as evidence (optional)</p>

          <label className="new-ticket-page__upload">
            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={files.length >= 3} />
            <Upload size={30} />
            <span>Click to upload an image</span>
            <small>{files.length}/3 attachments</small>
          </label>
        </section>

        <section className="new-ticket-page__card">
          <h2>Contact Information</h2>
          <p className="new-ticket-page__card-subtitle">How should we reach you about this ticket?</p>

          <div className="new-ticket-page__grid">
            <label>
              Email
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
            </label>

            <label>
              Phone
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0712345678"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
              />
            </label>
          </div>
        </section>

        {error && <p className="new-ticket-page__error">{error}</p>}

        <div className="new-ticket-page__actions">
          <button type="button" className="new-ticket-page__btn new-ticket-page__btn--ghost" onClick={() => navigate("/dashboard/incidents")} disabled={submitting}>Cancel</button>
          <button type="submit" className="new-ticket-page__btn new-ticket-page__btn--primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Ticket"}</button>
        </div>
      </form>
    </section>
  );
}
