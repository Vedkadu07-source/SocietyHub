import { useEffect, useState } from 'react'
import { api, type Complaint, type Dashboard } from '../../lib/api'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Open': { bg: '#FEF3C7', text: '#D97706' },
  'In Progress': { bg: '#EEF2FF', text: '#4338CA' },
  'Resolved': { bg: '#DCFCE7', text: '#059669' },
  'Pending Response': { bg: '#FEE2E2', text: '#DC2626' },
  'Critical': { bg: '#FEE2E2', text: '#DC2626' },
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  'Critical': { bg: '#FEE2E2', text: '#DC2626' },
  'High': { bg: '#FEF3C7', text: '#D97706' },
  'Medium': { bg: '#EEF2FF', text: '#4338CA' },
  'Low': { bg: '#F3F4F6', text: '#6B7280' },
}

const noticeColors: Record<string, string> = {
  'Meeting': '#4F46E5',
  'Event': '#D97706',
  'Maintenance': '#2563EB',
  'Policy': '#059669',
  'Finance': '#DC2626',
}

export default function Overview({ onNavigate }: { onNavigate: (page: 'c-notices' | 'c-treasury' | 'c-operations') => void }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getComplaints()])
      .then(([dashboardData, complaintData]) => {
        setDashboard(dashboardData)
        setComplaints(complaintData.data)
      })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load overview.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-[14px]" style={{ color: '#6B6660' }}>Loading overview...</div>
  if (error || !dashboard) return <div className="p-8 text-[14px]" role="alert" style={{ color: '#B91C1C' }}>{error || 'Unable to load overview.'}</div>

  const { recentNotices: notices, recentActivity: activityFeed, finance, society } = dashboard
  const openComplaints = dashboard.complaints.open
  const resolvedThisMonth = dashboard.complaints.resolved
  const collectionTarget = (society?.totalUnits ?? 0) * (society?.maintenancePerUnit ?? 0)
  const now = new Date()
  const currentMonthLabel = now.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
  const nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)

  return (
    <div>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: '340px', backgroundColor: '#0B1525' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&h=500&fit=crop&auto=format)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, rgba(11,21,37,0.92) 0%, rgba(11,21,37,0.70) 50%, rgba(15,30,60,0.60) 100%)' }}
        />

        <div className="relative z-10 px-8 pt-10 pb-12 flex flex-col justify-between h-full" style={{ minHeight: '340px' }}>
          <div>
            <p className="text-[10.5px] font-semibold tracking-widest mb-4" style={{ color: '#818CF8', letterSpacing: '0.14em' }}>
              COMMITTEE OVERVIEW · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
            <h1
              className="text-4xl md:text-5xl leading-tight mb-4 max-w-lg"
              style={{ fontFamily: 'var(--font-display)', color: '#FFFFFF' }}
            >
              {society?.name ?? 'Your Society'},<br />
              <span style={{ color: '#C7D2FE' }}>well governed.</span>
            </h1>
            <p className="text-[15px] leading-relaxed mb-8 max-w-sm" style={{ color: '#94A3B8' }}>
              Your community at a glance. {dashboard.residents.total} residents across {society?.wings ?? 0} wings.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('c-notices')}
                className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#4F46E5' }}
              >
                Post Announcement
              </button>
              <button
                onClick={() => onNavigate('c-treasury')}
                className="px-5 py-2.5 rounded-lg text-[13.5px] font-medium border transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#CBD5E1' }}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8 space-y-8">
        {/* ── Community Pulse ── */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[11px] font-semibold tracking-widest" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
              COMMUNITY PULSE
            </h2>
            <span className="text-[12px]" style={{ color: '#9A9591' }}>{currentMonthLabel}</span>
          </div>

          {/* Asymmetric metric strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border" style={{ borderColor: '#E5E2DC', backgroundColor: '#E5E2DC' }}>
            {/* Large primary metric */}
            <div className="bg-white px-5 py-5 col-span-1">
              <p className="text-[10.5px] font-semibold tracking-wider mb-2" style={{ color: '#9A9591', letterSpacing: '0.1em' }}>RESIDENTS</p>
              <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>{dashboard.residents.total}</p>
              <p className="text-[12px] mt-1" style={{ color: '#9A9591' }}>Across {society?.wings ?? 0} wings</p>
            </div>

            {/* Open complaints — warning treatment */}
            <div className="bg-white px-5 py-5">
              <p className="text-[10.5px] font-semibold tracking-wider mb-2" style={{ color: '#9A9591', letterSpacing: '0.1em' }}>OPEN COMPLAINTS</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#D97706' }}>{openComplaints}</p>
              </div>
              <p className="text-[12px] mt-1" style={{ color: '#9A9591' }}>Require attention</p>
            </div>

            {/* Resolved — success treatment */}
            <div className="bg-white px-5 py-5">
              <p className="text-[10.5px] font-semibold tracking-wider mb-2" style={{ color: '#9A9591', letterSpacing: '0.1em' }}>RESOLVED</p>
              <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>{resolvedThisMonth}</p>
              <p className="text-[12px] mt-1" style={{ color: '#9A9591' }}>Requests complete</p>
            </div>

            {/* Maintenance — financial */}
            <div className="bg-white px-5 py-5">
              <p className="text-[10.5px] font-semibold tracking-wider mb-2" style={{ color: '#9A9591', letterSpacing: '0.1em' }}>COLLECTED</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#4F46E5' }}>₹{(finance.currentMonthCollection / 100000).toFixed(1)}L</p>
              <p className="text-[12px] mt-1" style={{ color: '#9A9591' }}>{new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </section>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ── Left / Main Column ── */}
          <div className="md:col-span-2 space-y-8">

            {/* Active Notices */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold" style={{ color: '#1A1917' }}>Active Notices</h2>
                <button onClick={() => onNavigate('c-notices')} className="text-[12.5px] font-medium" style={{ color: '#4F46E5' }}>View all →</button>
              </div>
              <div className="space-y-0 border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC' }}>
                {notices.slice(0, 3).map((notice, i) => (
                  <div
                    key={notice.id}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#F9F8F5] cursor-pointer ${i > 0 ? 'border-t' : ''}`}
                    style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}
                  >
                    <div
                      className="w-1 flex-shrink-0 self-stretch rounded-full mt-1"
                      style={{ backgroundColor: noticeColors[notice.category] || '#4F46E5', minHeight: '40px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${noticeColors[notice.category]}15`,
                            color: noticeColors[notice.category],
                            letterSpacing: '0.07em',
                          }}
                        >
                          {notice.category.toUpperCase()}
                        </span>
                        {notice.priority === 'Urgent' && (
                          <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[13.5px] font-medium mb-0.5" style={{ color: '#1A1917' }}>{notice.title}</p>
                      <p className="text-[12px] line-clamp-1" style={{ color: '#9A9591' }}>{notice.preview}</p>
                    </div>
                    <p className="text-[11.5px] flex-shrink-0" style={{ color: '#B0ACA6' }}>{notice.date}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Navy Financial Block ── */}
            <section
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#0B1525' }}
            >
              <div className="px-7 pt-7 pb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-5" style={{ color: '#6B82A0', letterSpacing: '0.14em' }}>
                  MAINTENANCE COLLECTION · {currentMonthLabel.toUpperCase()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: '#6B82A0' }}>Total Collected</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>₹{formatINR(finance.currentMonthCollection)}</p>
                    <p className="text-[11px] mt-1" style={{ color: '#6B82A0' }}>of ₹{formatINR(collectionTarget)} target</p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: '#6B82A0' }}>Outstanding Dues</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>₹{formatINR(finance.outstandingDues)}</p>
                    <p className="text-[11px] mt-1" style={{ color: '#6B82A0' }}>{finance.pendingResidents} units pending</p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: '#6B82A0' }}>Collection Rate</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#34D399' }}>{finance.collectionRate}%</p>
                    <p className="text-[11px] mt-1" style={{ color: '#6B82A0' }}>+8% vs last month</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-2" style={{ color: '#6B82A0' }}>
                    <span>Collection Progress</span>
                    <span style={{ color: '#94A3B8' }}>{finance.collectionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#1F3352' }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${finance.collectionRate}%`, background: 'linear-gradient(90deg, #4F46E5, #34D399)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="px-7 py-4 border-t flex items-center justify-between" style={{ borderColor: '#1F3352' }}>
                <p className="text-[12px]" style={{ color: '#6B82A0' }}>Next due: {nextDueDate}</p>
                <button
                  disabled
                  title="Reminder delivery is not configured"
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
                >
                  Send Reminders
                </button>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-[15px] font-semibold mb-4" style={{ color: '#1A1917' }}>Recent Activity</h2>
              <div className="space-y-0 border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
                {activityFeed.map((item, i) => {
                  const iconColors = {
                    complaint: '#4F46E5',
                    notice: '#D97706',
                    payment: '#059669',
                    resolved: '#059669',
                  }
                  const color = iconColors[item.type as keyof typeof iconColors] || '#9A9591'
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3.5 px-5 py-3.5 ${i > 0 ? 'border-t' : ''}`}
                      style={{ borderColor: '#F0EDE8' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <p className="flex-1 text-[13px]" style={{ color: '#3C3A3E' }}>{item.action}</p>
                      <p className="text-[11.5px] flex-shrink-0" style={{ color: '#B0ACA6' }}>{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* ── Right / Side Column ── */}
          <div className="space-y-6">
            {/* Community Snapshot */}
            <section className="rounded-xl border p-5" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
              <h3 className="text-[13px] font-semibold mb-4" style={{ color: '#1A1917' }}>Community Snapshot</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Units', value: String(society?.totalUnits ?? 0), sub: `${society?.wings ?? 0} wings` },
                  { label: 'Occupied', value: String(dashboard.residents.total), sub: society?.totalUnits ? `${Math.round(dashboard.residents.total / society.totalUnits * 100)}%` : '0%' },
                  { label: 'Wings', value: String(society?.wings ?? 0), sub: 'Residential wings' },
                  { label: 'Paid Residents', value: String(finance.paidResidents), sub: `of ${dashboard.residents.total}` },
                  { label: 'Pending Residents', value: String(finance.pendingResidents), sub: 'Maintenance due' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#F0EDE8' }}>
                    <p className="text-[12.5px]" style={{ color: '#6B6660' }}>{item.label}</p>
                    <div className="text-right">
                      <p className="text-[13.5px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>{item.value}</p>
                      <p className="text-[10.5px]" style={{ color: '#B0ACA6' }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-xl border p-5" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
              <h3 className="text-[13px] font-semibold mb-3" style={{ color: '#1A1917' }}>Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Post New Notice', color: '#4F46E5', icon: '📌', destination: 'c-notices' as const },
                  { label: 'Send Payment Reminder', color: '#D97706', icon: '💬', destination: null },
                  { label: 'Review Complaints', color: '#DC2626', icon: '📋', destination: 'c-operations' as const },
                  { label: 'Generate Statement', color: '#059669', icon: '📊', destination: 'c-treasury' as const },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { if (action.destination) onNavigate(action.destination) }}
                    disabled={!action.destination}
                    title={!action.destination ? 'Reminder delivery is not configured' : undefined}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                    style={{ borderColor: '#E5E2DC', backgroundColor: 'transparent' }}
                  >
                    <span className="text-[14px]">{action.icon}</span>
                    <span className="text-[13px] font-medium" style={{ color: '#3C3A3E' }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Pending complaints summary */}
            <section className="rounded-xl border p-5" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
              <h3 className="text-[13px] font-semibold mb-3" style={{ color: '#1A1917' }}>Pending Requests</h3>
              <div className="space-y-2.5">
                {complaints.filter(c => c.status !== 'Resolved').slice(0, 3).map((c) => {
                  const p = priorityColors[c.priority] || priorityColors['Low']
                  return (
                    <div key={c.id} className="flex items-center gap-3 py-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.text }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium truncate" style={{ color: '#1A1917' }}>{c.unit}</p>
                        <p className="text-[11px] truncate" style={{ color: '#9A9591' }}>{c.issue}</p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: statusColors[c.status]?.bg, color: statusColors[c.status]?.text }}
                      >
                        {c.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
