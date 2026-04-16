// ticketService.js
// API interactions for incident tickets

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Helper: get JWT token from localStorage
const getToken = () => localStorage.getItem("sc_token");
const getUserId = () => localStorage.getItem("sc_user_id") || localStorage.getItem("userId") || "demo-user";
const getUserRole = () => localStorage.getItem("sc_user_role") || localStorage.getItem("userRole") || "USER";

// Helper: build headers
const headers = (isMultipart = false) => {
  const h = {};
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  h["X-User-Id"] = getUserId();
  h["X-User-Role"] = getUserRole();
  if (!isMultipart) h["Content-Type"] = "application/json";
  return h;
};

// Helper: handle response
const handleResponse = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.json(); msg = body.message || body.error || msg; } catch {}
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const ticketService = {

  // ── GET: My tickets (paginated, filtered)
  getMyTickets: async (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    const res = await fetch(`${BASE}/tickets/my?${q}`, { headers: headers() });
    return handleResponse(res);
  },

  // ── GET: All tickets (Admin only)
  getAllTickets: async (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    const res = await fetch(`${BASE}/tickets?${q}`, { headers: headers() });
    return handleResponse(res);
  },

  // ── GET: Single ticket by ID
  getTicketById: async (id) => {
    const res = await fetch(`${BASE}/tickets/${id}`, { headers: headers() });
    return handleResponse(res);
  },

  // ── POST: Create a new ticket
  createTicket: async (payload) => {
    const res = await fetch(`${BASE}/tickets`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── PUT: Update ticket (Admin/Technician)
  updateTicket: async (id, data) => {
    const res = await fetch(`${BASE}/tickets/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // ── PATCH: Update ticket status
  updateStatus: async (id, { status, resolutionNote }) => {
    const res = await fetch(`${BASE}/tickets/${id}/status`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ status, resolutionNotes: resolutionNote, rejectionReason: resolutionNote }),
    });
    return handleResponse(res);
  },

  // ── PATCH: Assign technician (Admin only)
  assignTechnician: async (id, technicianId) => {
    const res = await fetch(`${BASE}/tickets/${id}/assign`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ technicianId: technicianId }),
    });
    return handleResponse(res);
  },

  // ── DELETE: Delete a ticket (Admin only)
  deleteTicket: async (id) => {
    const res = await fetch(`${BASE}/tickets/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse(res);
  },

  // ── POST: Add a comment to a ticket
  addComment: async (ticketId, { content }) => {
    const res = await fetch(`${BASE}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // ── PUT: Edit a comment (owner only)
  updateComment: async (ticketId, commentId, { content }) => {
    const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // ── DELETE: Delete a comment (owner or Admin)
  deleteComment: async (ticketId, commentId) => {
    const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse(res);
  },

  // ── GET: Dashboard stats
  getStats: async () => {
    const res = await fetch(`${BASE}/tickets/stats`, { headers: headers() });
    return handleResponse(res);
  },

  // ── POST: Add attachment to existing ticket
  addAttachment: async (ticketId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/tickets/${ticketId}/attachments`, {
      method: "POST",
      headers: headers(true),
      body: fd,
    });
    return handleResponse(res);
  },

  // ── DELETE: Remove an attachment
  deleteAttachment: async (ticketId, attachmentId) => {
    const res = await fetch(`${BASE}/tickets/${ticketId}/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse(res);
  },
};
