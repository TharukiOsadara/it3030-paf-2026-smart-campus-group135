// ticketService.js
// API interactions for incident tickets

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const LOCAL_TICKETS_KEY = "sc_local_tickets";

// Helper: get JWT token from localStorage
const getToken = () => localStorage.getItem("sc_token");
const getUserId = () => localStorage.getItem("sc_user_id") || localStorage.getItem("userId") || "demo-user";
const getUserRole = () => localStorage.getItem("sc_user_role") || localStorage.getItem("userRole") || "USER";

const shouldUseLocalFallback = (error) => {
  if (!error) return false;
  if (error.status >= 500) return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("http 500");
};

const readLocalTickets = () => {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalTickets = (tickets) => {
  localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
};

const getTicketId = (ticket) => ticket?.id || ticket?._id || ticket?.ticketId || null;

const mergeTickets = (remoteTickets = [], localTickets = []) => {
  const merged = [...localTickets, ...remoteTickets];
  const seen = new Set();

  return merged.filter((ticket) => {
    const id = getTicketId(ticket);
    if (!id) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const createLocalTicket = (payload) => {
  const now = new Date().toISOString();
  const ticket = {
    id: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority,
    contactDetails: payload.contactDetails || "",
    userId: payload.userId || getUserId(),
    resourceId: payload.resourceId || null,
    location: payload.location,
    status: payload.status || "OPEN",
    assignedTo: payload.assignedTo || null,
    resolutionNotes: payload.resolutionNotes || null,
    rejectionReason: payload.rejectionReason || null,
    attachments: [],
    comments: [],
    activities: [],
    createdAt: now,
    updatedAt: now,
  };

  const existing = readLocalTickets();
  writeLocalTickets([ticket, ...existing]);
  return ticket;
};

const updateLocalTicket = (ticketId, updater) => {
  const tickets = readLocalTickets();
  const index = tickets.findIndex((ticket) => getTicketId(ticket) === ticketId);
  if (index < 0) return null;
  const updated = updater({ ...tickets[index] });
  tickets[index] = updated;
  writeLocalTickets(tickets);
  return updated;
};

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
    const error = new Error(msg);
    error.status = res.status;
    throw error;
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
    const localTickets = readLocalTickets();
    try {
      const q = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      ).toString();
      const res = await fetch(`${BASE}/tickets?${q}`, { headers: headers() });
      const remoteTickets = await handleResponse(res);
      const list = Array.isArray(remoteTickets) ? remoteTickets : [];
      return mergeTickets(list, localTickets);
    } catch (error) {
      if (shouldUseLocalFallback(error)) {
        return localTickets;
      }
      throw error;
    }
  },

  // ── GET: Single ticket by ID
  getTicketById: async (id) => {
    const localTicket = readLocalTickets().find((item) => getTicketId(item) === id);
    if (localTicket) return localTicket;

    try {
      const res = await fetch(`${BASE}/tickets/${id}`, { headers: headers() });
      return await handleResponse(res);
    } catch (error) {
      if (shouldUseLocalFallback(error)) {
        const ticket = readLocalTickets().find((item) => getTicketId(item) === id);
        if (ticket) return ticket;
      }
      throw error;
    }
  },

  // ── POST: Create a new ticket
  createTicket: async (payload) => {
    try {
      const res = await fetch(`${BASE}/tickets`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(res);
    } catch (error) {
      if (shouldUseLocalFallback(error)) {
        return createLocalTicket(payload);
      }
      throw error;
    }
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
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}/tickets/${ticketId}/attachments`, {
        method: "POST",
        headers: headers(true),
        body: fd,
      });
      return await handleResponse(res);
    } catch (error) {
      if (shouldUseLocalFallback(error)) {
        const updated = updateLocalTicket(ticketId, (ticket) => {
          const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : [];
          attachments.push({
            id: `ATT-${Date.now().toString(36).toUpperCase()}`,
            originalFileName: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size || 0,
            uploadedBy: getUserId(),
            uploadedAt: new Date().toISOString(),
          });
          ticket.attachments = attachments;
          ticket.updatedAt = new Date().toISOString();
          return ticket;
        });
        return updated || { id: ticketId };
      }
      throw error;
    }
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
