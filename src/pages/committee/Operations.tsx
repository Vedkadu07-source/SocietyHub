import { useEffect, useState } from 'react'
import { api, type Activity, type Complaint, type ComplaintStatus } from '../../lib/api'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Open': { bg: '#FEF3C7', text: '#D97706' },
  'In Progress': { bg: '#EEF2FF', text: '#4338CA' },
  'Resolved': { bg: '#DCFCE7', text: '#059669' },
  'Pending Response': { bg: '#FEE2E2', text: '#DC2626' },
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  'Critical': { bg: '#FEE2E2', text: '#DC2626' },
  'High': { bg: '#FEF3C7', text: '#B45309' },
  'Medium': { bg: '#EEF2FF', text: '#4338CA' },
  'Low': { bg: '#F3F4F6', text: '#6B7280' },
}

type StatusFilter = 'All' | 'Open' | 'In Progress' | 'Resolved' | 'Pending Response'

export default function Operations({ onNavigate }: { onNavigate: (page: 'c-notices') => void }) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [activityFeed, setActivityFeed] = useState<Activity[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getComplaints(), api.getActivities()])
      .then(([complaintResult, activityResult]) => {
        setComplaints(complaintResult.data)
        setActivityFeed(activityResult.data)
      })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load operations.'))
      .finally(() => setLoading(false))
  }, [])

  const changeStatus = async (id: string, status: ComplaintStatus) => {
    setError('')
    try {
      const updated = await api.updateComplaint(id, { status })
      setComplaints(current => current.map(complaint => complaint.id === id ? updated : complaint))
      const refreshedActivity = await api.getActivities()
      setActivityFeed(refreshedActivity.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update complaint.')
    }
  }

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    const matchesSearch = search === '' ||
      c.unit.toLowerCase().includes(search.toLowerCase()) ||
      c.resident.toLowerCase().includes(search.toLowerCase()) ||
      c.issue.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch && (!categoryFilter || c.category === categoryFilter)
  })

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    pending: complaints.filter(c => c.status === 'Pending Response').length,
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
          COMMITTEE OPERATIONS
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>
              Management Portal
            </h1>
            <p className="text-[14px] mt-1" style={{ color: '#6B6660' }}>
              {counts.open} open · {counts.inProgress} in progress · {counts.resolved} resolved
            </p>
          </div>
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('c-notices')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#4F46E5' }}
            >
              + New Notice
            </button>
            <button
              disabled
              title="Reminder delivery is not configured"
              className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-all"
              style={{ borderColor: '#D8D5CE', color: '#3C3A3E', backgroundColor: '#FFFFFF' }}
            >
              Send Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6">
        {error && <p role="alert" className="mb-4 text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        {loading && <p className="mb-4 text-[13px]" style={{ color: '#6B6660' }}>Loading complaints...</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-5">
            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg viewBox="0 0 16 16" fill="none" stroke="#9A9591" strokeWidth="1.5" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <path d="M10.5 10.5l3.5 3.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search complaints, units, residents…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-[13.5px] focus:outline-none"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={event => setCategoryFilter(event.target.value)}
                className="px-3.5 py-2.5 rounded-lg border text-[13.5px] focus:outline-none"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
              >
                <option value="">All Categories</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Civil</option>
                <option>Lift</option>
                <option>Security</option>
                <option>Community</option>
              </select>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Open', 'In Progress', 'Resolved', 'Pending Response'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                  style={
                    statusFilter === s
                      ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#6B6660' }
                  }
                >
                  {s}
                  {s === 'All' && (
                    <span className="ml-1.5 text-[10px] opacity-70">{counts.all}</span>
                  )}
                  {s === 'Open' && (
                    <span className="ml-1.5 text-[10px] opacity-70">{counts.open}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E5E2DC' }}>
              {/* Header */}
              <div
                className="grid text-[10.5px] font-semibold tracking-wider px-5 py-3"
                style={{
                  color: '#9A9591',
                  backgroundColor: '#F9F8F5',
                  letterSpacing: '0.08em',
                  gridTemplateColumns: '80px 110px 1fr 80px 100px 1fr',
                  gap: '0 12px',
                }}
              >
                <span>ID</span>
                <span>UNIT</span>
                <span>ISSUE</span>
                <span>PRIORITY</span>
                <span>STATUS</span>
                <span>DATE</span>
              </div>

              {/* Rows */}
              {filtered.map((c, i) => {
                const sc = statusColors[c.status] || { bg: '#F3F4F6', text: '#6B7280' }
                const pc = priorityColors[c.priority] || priorityColors['Low']
                return (
                  <div
                    key={c.id}
                    className={`sh-table-row grid px-5 py-3.5 items-center cursor-pointer ${i > 0 ? 'border-t' : ''}`}
                    style={{
                      borderColor: '#F0EDE8',
                      backgroundColor: '#FFFFFF',
                      gridTemplateColumns: '80px 110px 1fr 80px 100px 1fr',
                      gap: '0 12px',
                    }}
                  >
                    <span className="text-[11.5px] font-mono font-medium" style={{ color: '#9A9591' }}>{c.id}</span>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: '#1A1917' }}>{c.unit}</p>
                      <p className="text-[11px]" style={{ color: '#9A9591' }}>{c.resident}</p>
                    </div>
                    <p className="text-[12.5px] line-clamp-2" style={{ color: '#3C3A3E' }}>{c.issue}</p>
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded self-start"
                      style={{ backgroundColor: pc.bg, color: pc.text }}
                    >
                      {c.priority}
                    </span>
                    <select aria-label={`Status for ${c.id}`} value={c.status} onChange={event => void changeStatus(c.id, event.target.value as ComplaintStatus)} className="min-w-0 rounded border px-1 py-1 text-[10px] font-semibold" style={{ borderColor: sc.bg, backgroundColor: sc.bg, color: sc.text }}>
                      {(['Open', 'In Progress', 'Resolved', 'Pending Response'] as ComplaintStatus[]).map(status => <option key={status}>{status}</option>)}
                    </select>
                    <p className="text-[12px]" style={{ color: '#9A9591' }}>{c.date}</p>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="py-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
                  <p className="text-[14px]" style={{ color: '#9A9591' }}>No complaints match your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions mobile */}
            <div className="md:hidden flex gap-2">
              <button onClick={() => onNavigate('c-notices')} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ backgroundColor: '#4F46E5' }}>
                + New Notice
              </button>
              <button disabled title="Reminder delivery is not configured" className="flex-1 py-2.5 rounded-lg text-[13px] font-medium border disabled:opacity-50" style={{ borderColor: '#D8D5CE', color: '#3C3A3E' }}>
                Reminder
              </button>
            </div>

            {/* Recent Activity */}
            <section className="rounded-xl border overflow-hidden" style={{ borderColor: '#E5E2DC' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
                <h3 className="text-[13px] font-semibold" style={{ color: '#1A1917' }}>Recent Activity</h3>
              </div>
              <div style={{ backgroundColor: '#FFFFFF' }}>
                {activityFeed.map((item, i) => {
                  const colors = {
                    complaint: '#4F46E5',
                    notice: '#D97706',
                    payment: '#059669',
                    resolved: '#059669',
                  }
                  const color = colors[item.type as keyof typeof colors] || '#9A9591'
                  return (
                    <div
                      key={item.id}
                      className={`px-5 py-3.5 flex gap-3 ${i > 0 ? 'border-t' : ''}`}
                      style={{ borderColor: '#F0EDE8' }}
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1">
                        <p className="text-[12.5px]" style={{ color: '#3C3A3E' }}>{item.action}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#B0ACA6' }}>{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>

        {/* ── Bottom Summary Bar ── */}
        <div
          className="mt-8 rounded-xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ backgroundColor: '#0B1525' }}
        >
          {[
            { label: 'OPEN', value: counts.open, color: '#F59E0B' },
            { label: 'IN PROGRESS', value: counts.inProgress, color: '#818CF8' },
            { label: 'RESOLVED', value: counts.resolved, color: '#34D399' },
            { label: 'PENDING RESPONSE', value: counts.pending, color: '#F87171' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[9.5px] font-semibold tracking-widest mb-2" style={{ color: '#6B82A0', letterSpacing: '0.12em' }}>
                {item.label}
              </p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
