import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from '../services/ticketService.jsx'

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

const initialForm = {
  title: '',
  description: '',
  category: '',
  priority: 'MEDIUM',
  contactDetails: '',
  userId: '1',
  resourceId: '',
  location: '',
  status: 'OPEN',
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    userId: '',
    search: '',
  })

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== ''),
    [filters]
  )

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      )
      const response = await getTickets(params)
      setTickets(response.data)
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        ...form,
        userId: Number(form.userId),
        resourceId: form.resourceId ? Number(form.resourceId) : null,
      }

      if (editingId) {
        await updateTicket(editingId, payload)
      } else {
        await createTicket(payload)
      }

      resetForm()
      await loadTickets()
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (ticket) => {
    setEditingId(ticket.id)
    setForm({
      title: ticket.title || '',
      description: ticket.description || '',
      category: ticket.category || '',
      priority: ticket.priority || 'MEDIUM',
      contactDetails: ticket.contactDetails || '',
      userId: ticket.userId ? String(ticket.userId) : '1',
      resourceId: ticket.resourceId ? String(ticket.resourceId) : '',
      location: ticket.location || '',
      status: ticket.status || 'OPEN',
    })
  }

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id)
      await loadTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  return (
    <div>
      <header className="mb-10 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">Module C</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Maintenance Tickets</h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Create, track, and filter campus maintenance tickets with status and priority visibility.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/25"
        >
          <h2 className="text-lg font-semibold text-white">
            {editingId ? `Edit Ticket #${editingId}` : 'Create Ticket'}
          </h2>

          <div className="mt-5 grid gap-4">
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Title"
              required
              className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Description"
              required
              rows={4}
              className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="Category"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <select
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              >
                {priorityOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              >
                {statusOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <input
                name="contactDetails"
                value={form.contactDetails}
                onChange={handleFormChange}
                placeholder="Contact details"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="number"
                min="1"
                name="userId"
                value={form.userId}
                onChange={handleFormChange}
                placeholder="User ID"
                required
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <input
                type="number"
                min="1"
                name="resourceId"
                value={form.resourceId}
                onChange={handleFormChange}
                placeholder="Resource ID"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <input
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Location"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Ticket' : 'Create Ticket'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#F59E0B]/60 hover:bg-[#1E293B]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/25">
          <h2 className="text-lg font-semibold text-white">Filter Tickets</h2>
          <div className="mt-5 grid gap-4">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search title or description"
              className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              >
                <option value="">All statuses</option>
                {statusOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              >
                <option value="">All priorities</option>
                {priorityOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Category"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
              <input
                type="number"
                min="1"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="User ID"
                className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadTickets}
                className="rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ status: '', priority: '', category: '', userId: '', search: '' })
                  }
                  className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#3B82F6]/60 hover:bg-[#1E293B]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/25">
        <h2 className="text-lg font-semibold text-white">Tickets</h2>

        {loading ? (
          <p className="mt-4 text-sm text-[#94A3B8]">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="mt-4 text-sm text-[#94A3B8]">No tickets found.</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-xl border border-[#334155] bg-[#0B1220] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#94A3B8]">Ticket #{ticket.id}</p>
                    <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                    <p className="mt-1 text-sm text-[#CBD5E1]">{ticket.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(ticket)}
                      className="rounded-lg border border-[#3B82F6]/50 px-3 py-1.5 text-xs font-semibold text-[#93C5FD] hover:bg-[#1E3A8A]/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ticket.id)}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#334155] px-2.5 py-1 text-white">{ticket.status}</span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-300">{ticket.priority}</span>
                  {ticket.category && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-300">
                      {ticket.category}
                    </span>
                  )}
                  <span className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[#CBD5E1]">User {ticket.userId}</span>
                  {ticket.resourceId && (
                    <span className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[#CBD5E1]">
                      Resource {ticket.resourceId}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
