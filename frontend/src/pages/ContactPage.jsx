import { useState } from "react";

const CONTACT_CHANNELS = [
  { icon: "📧", label: "Email", value: "smartcampus@sliit.lk", sub: "Typical response within 24 hours" },
  { icon: "📍", label: "Location", value: "SLIIT, Malabe, Colombo", sub: "Faculty of Computing" },
  { icon: "⏰", label: "Support Hours", value: "Mon–Fri, 8 AM – 6 PM", sub: "GMT +5:30 (Sri Lanka)" },
];

const FAQ = [
  { q: "How do I report an incident?", a: "Click 'Report an Issue' in the navigation bar or go to My Tickets → New Ticket. Fill in the details and optionally attach up to 3 image files as evidence." },
  { q: "Can I attach photos to a ticket?", a: "Yes! Each ticket supports up to 3 image attachments. Supported formats: JPG, PNG, WEBP (max 10MB each)." },
  { q: "How long until my ticket is resolved?", a: "High-priority tickets are typically acknowledged within 2 hours. Resolution times depend on complexity, but you'll receive live updates throughout." },
  { q: "How do I sign in?", a: "We use Google OAuth 2.0. Click 'Sign In with Google' and use your university email account." },
];

const INITIAL = { name: "", email: "", subject: "", category: "", message: "" };

function validate(form) {
  const errors = {};
  if (!form.name.trim())            errors.name    = "Full name is required.";
  else if (form.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";

  if (!form.email.trim())           errors.email   = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address.";

  if (!form.subject.trim())         errors.subject = "Subject is required.";
  else if (form.subject.trim().length < 5) errors.subject = "Subject must be at least 5 characters.";

  if (!form.category)               errors.category = "Please select a category.";

  if (!form.message.trim())         errors.message = "Message is required.";
  else if (form.message.trim().length < 20) errors.message = "Message must be at least 20 characters.";

  return errors;
}

export default function ContactPage() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus]   = useState(null); // "sending" | "success" | "error"
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(INITIAL).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    // Simulate API call
    await new Promise(res => setTimeout(res, 1800));
    setStatus("success");
    setForm(INITIAL);
    setTouched({});
    setErrors({});
  };

  const charLeft = 500 - form.message.length;

  return (
    <div className="contact-page page-wrapper">
      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-hero__orb contact-hero__orb--1" />
        <div className="contact-hero__orb contact-hero__orb--2" />
        <div className="contact-hero__content">
          <p className="contact-hero__eyebrow animate-fadeInUp">Get in Touch</p>
          <h1 className="contact-hero__headline animate-fadeInUp delay-100">
            We're here to<br />
            <span className="contact-hero__accent">help you.</span>
          </h1>
          <p className="contact-hero__sub animate-fadeInUp delay-200">
            Have a question about the platform? Encountering an issue? Or just want to give feedback?
            Reach out and we'll get back to you promptly.
          </p>
        </div>
      </section>

      {/* ── CHANNELS ── */}
      <section className="section contact-channels">
        <div className="contact-channels__grid">
          {CONTACT_CHANNELS.map((c, i) => (
            <div key={i} className="channel-card animate-fadeInUp" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="channel-card__icon">{c.icon}</div>
              <div>
                <p className="channel-card__label">{c.label}</p>
                <p className="channel-card__value">{c.value}</p>
                <p className="channel-card__sub">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORM + FAQ ── */}
      <section className="section contact-main">
        {/* Form */}
        <div className="contact-form-wrap animate-fadeInUp">
          <div className="contact-form-header">
            <h2 className="contact-form-title">Send a Message</h2>
            <p className="contact-form-sub">Fill out the form below and our team will respond within 24 hours.</p>
          </div>

          {status === "success" ? (
            <div className="contact-success animate-scaleIn">
              <div className="contact-success__icon">✓</div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => setStatus(null)}>Send Another</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form__row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="e.g. Kasun Perera"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.name && touched.name ? "error" : ""}
                    maxLength={100}
                  />
                  {touched.name && errors.name && <p className="form-error">⚠ {errors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    id="email" name="email" type="email"
                    placeholder="e.g. kasun@sliit.lk"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.email && touched.email ? "error" : ""}
                  />
                  {touched.email && errors.email && <p className="form-error">⚠ {errors.email}</p>}
                </div>
              </div>

              <div className="contact-form__row">
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject *</label>
                  <input
                    id="subject" name="subject" type="text"
                    placeholder="Brief description of your inquiry"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.subject && touched.subject ? "error" : ""}
                    maxLength={150}
                  />
                  {touched.subject && errors.subject && <p className="form-error">⚠ {errors.subject}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category *</label>
                  <select
                    id="category" name="category"
                    value={form.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.category && touched.category ? "error" : ""}
                  >
                    <option value="">Select a category...</option>
                    <option value="booking">Booking Issue</option>
                    <option value="ticket">Incident Ticket Help</option>
                    <option value="account">Account / Login</option>
                    <option value="technical">Technical Problem</option>
                    <option value="feedback">Feedback / Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                  {touched.category && errors.category && <p className="form-error">⚠ {errors.category}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message *</label>
                <textarea
                  id="message" name="message"
                  rows={5}
                  placeholder="Describe your issue or question in detail (minimum 20 characters)..."
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.message && touched.message ? "error" : ""}
                  maxLength={500}
                  style={{ resize: "vertical", minHeight: 120 }}
                />
                <div className="form-hint" style={{ display: "flex", justifyContent: "space-between" }}>
                  {touched.message && errors.message
                    ? <span className="form-error">⚠ {errors.message}</span>
                    : <span>Be as specific as possible</span>
                  }
                  <span style={{ color: charLeft < 50 ? "var(--color-warn)" : undefined }}>
                    {charLeft} chars left
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-gradient btn-lg contact-form__submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <span className="contact-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div className="contact-faq animate-fadeInUp delay-200">
          <h2 className="contact-faq__title">Frequently Asked</h2>
          <div className="contact-faq__list">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? "faq-item--open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq-item__question">
                  <span>{item.q}</span>
                  <span className="faq-item__chevron">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l3 3 3-3"/>
                    </svg>
                  </span>
                </div>
                <div className="faq-item__answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
