import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../services/TicketServices";
import "./NewTicketPage.css";

const CATEGORIES = [
  { value: "ELECTRICAL",   label: "⚡ Electrical",       desc: "Power, lighting, sockets" },
  { value: "PLUMBING",     label: "🔧 Plumbing",         desc: "Leaks, drains, water supply" },
  { value: "HVAC",         label: "❄️ HVAC",             desc: "AC, heating, ventilation" },
  { value: "IT_EQUIPMENT", label: "💻 IT Equipment",     desc: "Projectors, PCs, network" },
  { value: "STRUCTURAL",   label: "🏗️ Structural",       desc: "Walls, ceiling, doors" },
  { value: "CLEANING",     label: "🧹 Cleaning",         desc: "Sanitation, waste, hygiene" },
  { value: "SAFETY",       label: "⚠️ Safety",           desc: "Hazards, fire safety" },
  { value: "OTHER",        label: "📋 Other",            desc: "Anything else" },
];

const PRIORITIES = [
  { value: "LOW",      label: "Low",      desc: "Minor inconvenience",   color: "var(--priority-low)" },
  { value: "MEDIUM",   label: "Medium",   desc: "Moderate impact",       color: "var(--priority-medium)" },
  { value: "HIGH",     label: "High",     desc: "Significant disruption",color: "var(--priority-high)" },
  { value: "CRITICAL", label: "Critical", desc: "Urgent – safety risk",  color: "var(--priority-critical)" },
];

const INITIAL = {
  title: "", description: "", category: "", priority: "MEDIUM",
  location: "", contactName: "", contactPhone: "", contactEmail: ""
};

function validate(form, attachments) {
  const errors = {};
  if (!form.title.trim())       errors.title    = "Title is required.";
  else if (form.title.trim().length < 10) errors.title = "Title must be at least 10 characters.";
  else if (form.title.trim().length > 150) errors.title = "Title cannot exceed 150 characters.";

  if (!form.description.trim()) errors.description = "Description is required.";
  else if (form.description.trim().length < 20) errors.description = "Describe the issue in at least 20 characters.";

  if (!form.category)           errors.category  = "Please select a category.";
  if (!form.priority)           errors.priority  = "Please select a priority level.";

  if (!form.location.trim())    errors.location  = "Location is required.";
  else if (form.location.trim().length < 5) errors.location = "Please provide a specific location.";

  if (!form.contactName.trim()) errors.contactName = "Contact name is required.";

  if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
    errors.contactEmail = "Enter a valid email address.";

  if (form.contactPhone && !/^[\d\s+\-()]{7,15}$/.test(form.contactPhone))
    errors.contactPhone = "Enter a valid phone number.";

  if (attachments.length > 3)
    errors.attachments = "Maximum 3 attachments allowed.";

  return errors;
}

export default function NewTicketPage() {
  const navigate    = useNavigate();
  const fileRef     = useRef(null);
  const [form, setForm]             = useState(INITIAL);
  const [errors, setErrors]         = useState({});
  const [touched, setTouched]       = useState({});
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [step, setStep]             = useState(1); // 1=Details, 2=Contact, 3=Review
  const TOTAL_STEPS = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value }, attachments);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(form, attachments);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const handleCategorySelect = (val) => {
    setForm(prev => ({ ...prev, category: val }));
    setTouched(prev => ({ ...prev, category: true }));
    const errs = validate({ ...form, category: val }, attachments);
    setErrors(prev => ({ ...prev, category: errs.category }));
  };

  const handlePrioritySelect = (val) => {
    setForm(prev => ({ ...prev, priority: val }));
  };

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const newFiles = [];
    const fileErrors = [];

    files.forEach(f => {
      if (!allowed.includes(f.type))   { fileErrors.push(`${f.name}: Only image files allowed.`); return; }
      if (f.size > maxSize)            { fileErrors.push(`${f.name}: File exceeds 10MB limit.`); return; }
      if (attachments.length + newFiles.length >= 3) { fileErrors.push("Maximum 3 attachments allowed."); return; }
      newFiles.push({ file: f, preview: URL.createObjectURL(f), name: f.name, size: f.size });
    });

    if (fileErrors.length)
      setErrors(prev => ({ ...prev, attachments: fileErrors[0] }));
    else
      setErrors(prev => ({ ...prev, attachments: undefined }));

    setAttachments(prev => [...prev, ...newFiles].slice(0, 3));
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
    setErrors(prev => ({ ...prev, attachments: undefined }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    handleFileAdd({ target: { files: dt.files, value: "" } });
  };

  // Step validation
  const getStepFields = (s) => {
    if (s === 1) return ["title", "description", "category", "priority", "location"];
    if (s === 2) return ["contactName", "contactEmail", "contactPhone"];
    return [];
  };

  const validateStep = (s) => {
    const fields = getStepFields(s);
    const touchedFields = fields.reduce((a, f) => ({ ...a, [f]: true }), {});
    setTouched(prev => ({ ...prev, ...touchedFields }));
    const errs = validate(form, attachments);
    const stepErrs = fields.reduce((a, f) => errs[f] ? { ...a, [f]: errs[f] } : a, {});
    setErrors(prev => ({ ...prev, ...stepErrs }));
    return Object.keys(stepErrs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("title",        form.title.trim());
      formData.append("description",  form.description.trim());
      formData.append("category",     form.category);
      formData.append("priority",     form.priority);
      formData.append("location",     form.location.trim());
      formData.append("contactName",  form.contactName.trim());
      if (form.contactPhone) formData.append("contactPhone", form.contactPhone);
      if (form.contactEmail) formData.append("contactEmail", form.contactEmail);
      attachments.forEach(a => formData.append("attachments", a.file));

      const result = await ticketService.createTicket(formData);
      navigate(`/tickets/${result.id}`, { state: { created: true } });
    } catch (err) {
      setSubmitError(err?.message || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);
  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="new-ticket-page page-wrapper">
      {/* HEADER */}
      <div className="new-ticket-header">
        <div className="new-ticket-header__inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/tickets")}>
            ← Back to Tickets
          </button>
          <div>
            <p className="new-ticket-header__eyebrow">Module C – Incident Ticketing</p>
            <h1 className="new-ticket-header__title">Report an Incident</h1>
          </div>
        </div>
      </div>

      <div className="new-ticket-body">
        {/* STEPPER */}
        <div className="stepper">
          {["Incident Details", "Contact Info", "Review & Submit"].map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className={`stepper__step ${active ? "stepper__step--active" : ""} ${done ? "stepper__step--done" : ""}`}>
                <div className="stepper__circle">
                  {done ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 7l3 3 6-5"/>
                    </svg>
                  ) : s}
                </div>
                <span className="stepper__label">{label}</span>
                {i < 2 && <div className={`stepper__line ${done ? "stepper__line--done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* FORM CARD */}
        <div className="new-ticket-card">

          {/* ── STEP 1: DETAILS ── */}
          {step === 1 && (
            <div className="ticket-step animate-fadeInUp">
              <h2 className="ticket-step__title">Incident Details</h2>
              <p className="ticket-step__sub">Provide clear information about the issue so we can respond quickly.</p>

              <div className="ticket-step__fields">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Incident Title <span className="required">*</span>
                  </label>
                  <input
                    id="title" name="title" type="text"
                    placeholder="e.g. Projector not working in Lab A-302"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.title && errors.title ? "error" : ""}
                    maxLength={150}
                  />
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    {touched.title && errors.title
                      ? <p className="form-error">⚠ {errors.title}</p>
                      : <p className="form-hint">Be specific – include room/building name</p>
                    }
                    <p className="form-hint">{form.title.length}/150</p>
                  </div>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Category <span className="required">*</span></label>
                  <div className="category-grid">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        className={`category-btn ${form.category === c.value ? "category-btn--active" : ""}`}
                        onClick={() => handleCategorySelect(c.value)}
                      >
                        <span className="category-btn__icon">{c.label.split(" ")[0]}</span>
                        <span className="category-btn__name">{c.label.split(" ").slice(1).join(" ")}</span>
                        <span className="category-btn__desc">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                  {touched.category && errors.category && <p className="form-error">⚠ {errors.category}</p>}
                </div>

                {/* Priority */}
                <div className="form-group">
                  <label className="form-label">Priority Level <span className="required">*</span></label>
                  <div className="priority-options">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        className={`priority-btn ${form.priority === p.value ? "priority-btn--active" : ""}`}
                        style={{ "--p-color": p.color }}
                        onClick={() => handlePrioritySelect(p.value)}
                      >
                        <span className="priority-btn__dot" />
                        <div>
                          <span className="priority-btn__label">{p.label}</span>
                          <span className="priority-btn__desc">{p.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location <span className="required">*</span>
                  </label>
                  <input
                    id="location" name="location" type="text"
                    placeholder="e.g. Block A, Room 302 / 3rd Floor Corridor"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.location && errors.location ? "error" : ""}
                  />
                  {touched.location && errors.location && <p className="form-error">⚠ {errors.location}</p>}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description" name="description"
                    rows={5}
                    placeholder="Describe the issue in detail — what happened, when it started, any relevant context..."
                    value={form.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.description && errors.description ? "error" : ""}
                    maxLength={1000}
                    style={{ resize: "vertical", minHeight: 120 }}
                  />
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    {touched.description && errors.description
                      ? <p className="form-error">⚠ {errors.description}</p>
                      : <p className="form-hint">The more detail, the faster we can help</p>
                    }
                    <p className="form-hint">{form.description.length}/1000</p>
                  </div>
                </div>

                {/* Attachments */}
                <div className="form-group">
                  <label className="form-label">
                    Attachments <span className="form-hint">(Optional – max 3 images, 10MB each)</span>
                  </label>

                  {attachments.length < 3 && (
                    <div
                      className="drop-zone"
                      onClick={() => fileRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onDragEnter={e => e.currentTarget.classList.add("drop-zone--over")}
                      onDragLeave={e => e.currentTarget.classList.remove("drop-zone--over")}
                    >
                      <div className="drop-zone__icon">📎</div>
                      <p className="drop-zone__text">
                        <strong>Click to upload</strong> or drag & drop
                      </p>
                      <p className="drop-zone__hint">JPG, PNG, WEBP, GIF · max 10MB each · {3 - attachments.length} slot{3 - attachments.length !== 1 ? "s" : ""} remaining</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileAdd}
                        style={{ display: "none" }}
                      />
                    </div>
                  )}

                  {errors.attachments && <p className="form-error">⚠ {errors.attachments}</p>}

                  {attachments.length > 0 && (
                    <div className="attachment-previews">
                      {attachments.map((a, i) => (
                        <div key={i} className="attachment-preview">
                          <img src={a.preview} alt={a.name} />
                          <div className="attachment-preview__info">
                            <span className="attachment-preview__name">{a.name}</span>
                            <span className="attachment-preview__size">
                              {(a.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <button
                            type="button"
                            className="attachment-preview__remove"
                            onClick={() => removeAttachment(i)}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: CONTACT ── */}
          {step === 2 && (
            <div className="ticket-step animate-fadeInUp">
              <h2 className="ticket-step__title">Contact Information</h2>
              <p className="ticket-step__sub">So our technicians can reach you for follow-up.</p>

              <div className="ticket-step__fields">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="contactName" name="contactName" type="text"
                    placeholder="Your full name"
                    value={form.contactName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.contactName && errors.contactName ? "error" : ""}
                  />
                  {touched.contactName && errors.contactName && <p className="form-error">⚠ {errors.contactName}</p>}
                </div>

                <div className="new-ticket-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactEmail">Email Address</label>
                    <input
                      id="contactEmail" name="contactEmail" type="email"
                      placeholder="e.g. kasun@sliit.lk"
                      value={form.contactEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.contactEmail && errors.contactEmail ? "error" : ""}
                    />
                    {touched.contactEmail && errors.contactEmail && <p className="form-error">⚠ {errors.contactEmail}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactPhone">Phone Number</label>
                    <input
                      id="contactPhone" name="contactPhone" type="tel"
                      placeholder="e.g. +94 77 123 4567"
                      value={form.contactPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.contactPhone && errors.contactPhone ? "error" : ""}
                    />
                    {touched.contactPhone && errors.contactPhone && <p className="form-error">⚠ {errors.contactPhone}</p>}
                  </div>
                </div>

                <div className="contact-note">
                  <span>ℹ️</span>
                  <p>At least one contact method (email or phone) is recommended so our team can reach you for updates.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === 3 && (
            <div className="ticket-step animate-fadeInUp">
              <h2 className="ticket-step__title">Review & Submit</h2>
              <p className="ticket-step__sub">Please review your ticket details before submitting.</p>

              <div className="review-card">
                <div className="review-section">
                  <h3 className="review-section__title">Incident Details</h3>
                  <div className="review-row"><span>Title</span><strong>{form.title}</strong></div>
                  <div className="review-row"><span>Category</span>
                    <strong>{selectedCategory?.label}</strong>
                  </div>
                  <div className="review-row"><span>Priority</span>
                    <span className={`badge badge-${form.priority.toLowerCase()}`}>{form.priority}</span>
                  </div>
                  <div className="review-row"><span>Location</span><strong>{form.location}</strong></div>
                  <div className="review-row review-row--desc">
                    <span>Description</span>
                    <p>{form.description}</p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="review-row">
                      <span>Attachments</span>
                      <div className="review-attachments">
                        {attachments.map((a, i) => (
                          <img key={i} src={a.preview} alt={a.name} className="review-attachment-img" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="review-section">
                  <h3 className="review-section__title">Contact</h3>
                  <div className="review-row"><span>Name</span><strong>{form.contactName}</strong></div>
                  {form.contactEmail && <div className="review-row"><span>Email</span><strong>{form.contactEmail}</strong></div>}
                  {form.contactPhone && <div className="review-row"><span>Phone</span><strong>{form.contactPhone}</strong></div>}
                </div>
              </div>

              {submitError && (
                <div className="submit-error">
                  <span>⚠</span> {submitError}
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="ticket-step-nav">
            {step > 1 && (
              <button type="button" className="btn btn-ghost" onClick={prevStep} disabled={submitting}>
                ← Back
              </button>
            )}
            <div style={{flex:1}} />
            {step < TOTAL_STEPS ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-gradient btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="contact-spinner" /> Submitting...</>
                ) : "Submit Ticket 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}