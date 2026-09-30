import { useEffect, useState, type FormEvent } from 'react'
import { api, type Resident } from '../../lib/api'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Paid': { bg: '#DCFCE7', text: '#059669' },
  'Pending': { bg: '#FEF3C7', text: '#D97706' },
  'Overdue': { bg: '#FEE2E2', text: '#DC2626' },
}

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getResidents(search)
      .then(result => setResidents(result.data))
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load residents.'))
      .finally(() => setLoading(false))
  }, [search])

  const exportDirectory = async () => {
    try {
      await api.exportResidents()
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to export residents.')
    }
  }

  const addResident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const values = {
        name: String(form.get('name')), phone: String(form.get('phone')),
        email: String(form.get('email')), maintenance: Number(form.get('maintenance')),
      }
      if (editingResident) await api.updateResident(editingResident.id, values)
      else await api.createResident({ ...values, unit: String(form.get('unit')) })
      setShowAdd(false)
      setEditingResident(null)
      setSearch('')
      const result = await api.getResidents()
      setResidents(result.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add resident.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = residents.filter(r => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.unit.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
    return matchStatus && matchSearch
  })

  const counts = {
    all: residents.length,
    paid: residents.filter(r => r.status === 'Paid').length,
    pending: residents.filter(r => r.status === 'Pending').length,
    overdue: residents.filter(r => r.status === 'Overdue').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
          RESIDENT DIRECTORY
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>
              Residents
            </h1>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }} />
                <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{counts.paid} paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97706' }} />
                <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{counts.pending} pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{counts.overdue} overdue</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingResident(null); setShowAdd(true) }} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ backgroundColor: '#4F46E5' }}>Add Resident</button>
            <button onClick={() => void exportDirectory()} className="px-4 py-2 rounded-lg text-[13px] font-semibold border hidden md:block" style={{ borderColor: '#D8D5CE', color: '#3C3A3E', backgroundColor: '#FFFFFF' }}>Export Directory</button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-5">
        {error && <p role="alert" className="text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        {loading && <p className="text-[13px]" style={{ color: '#6B6660' }}>Loading residents...</p>}
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg viewBox="0 0 16 16" fill="none" stroke="#9A9591" strokeWidth="1.5" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10.5 10.5l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search residents, units, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-[13.5px] focus:outline-none"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Paid', 'Pending', 'Overdue'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3.5 py-2 rounded-lg text-[12.5px] font-medium border transition-all"
                style={
                  statusFilter === s
                    ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5', color: '#FFFFFF' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#6B6660' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E5E2DC' }}>
          <div
            className="hidden md:grid text-[10.5px] font-semibold tracking-wider px-5 py-3"
            style={{
              color: '#9A9591',
              backgroundColor: '#F9F8F5',
              letterSpacing: '0.08em',
              gridTemplateColumns: '200px 80px 140px 100px 90px 130px',
              gap: '0 16px',
            }}
          >
            <span>RESIDENT</span>
            <span>UNIT</span>
            <span>PHONE</span>
            <span>MAINTENANCE</span>
            <span>STATUS</span>
            <span>LAST PAYMENT</span>
          </div>

          {filtered.map((r, i) => {
            const sc = statusColors[r.status] || { bg: '#F3F4F6', text: '#6B7280' }
            const initials = r.name.split(' ').map(n => n[0]).join('').slice(0, 2)
            const avatarColors = ['#4F46E5', '#059669', '#D97706', '#2563EB', '#DC2626', '#7C3AED', '#0891B2', '#D97706']
            const avatarColor = avatarColors[i % avatarColors.length]

            return (
              <div key={r.id}>
                {/* Desktop row */}
                <div
                  className={`sh-table-row hidden md:grid px-5 py-3.5 items-center ${i > 0 ? 'border-t' : ''}`}
                  style={{
                    borderColor: '#F0EDE8',
                    backgroundColor: '#FFFFFF',
                    gridTemplateColumns: '200px 80px 140px 100px 90px 130px',
                    gap: '0 16px',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: '#1A1917' }}>{r.name}</span>
                    <button type="button" onClick={() => { setEditingResident(r); setShowAdd(true) }} aria-label={`Edit ${r.name}`} className="text-[11px] font-medium" style={{ color: '#4F46E5' }}>Edit</button>
                  </div>
                  <span className="text-[12.5px] font-mono" style={{ color: '#6B6660' }}>{r.unit}</span>
                  <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{r.phone}</span>
                  <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>
                    ₹{r.maintenance.toLocaleString('en-IN')}
                  </span>
                  <span
                    className="text-[10.5px] font-semibold px-2.5 py-1 rounded"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >
                    {r.status}
                  </span>
                  <span className="text-[12px]" style={{ color: '#9A9591' }}>{r.lastPayment}</span>
                </div>

                {/* Mobile card */}
                <div
                  className={`md:hidden px-4 py-4 flex items-center gap-3 ${i > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFFFF' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2"><p className="text-[13.5px] font-semibold" style={{ color: '#1A1917' }}>{r.name}</p><button type="button" onClick={() => { setEditingResident(r); setShowAdd(true) }} aria-label={`Edit ${r.name}`} className="text-[11px] font-medium" style={{ color: '#4F46E5' }}>Edit</button></div>
                      <span
                        className="text-[9.5px] font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[12px]" style={{ color: '#9A9591' }}>
                      {r.unit} · ₹{r.maintenance.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          {!loading && filtered.length === 0 && <p className="px-5 py-8 text-center text-[13px]" style={{ color: '#9A9591', backgroundColor: '#FFFFFF' }}>No residents match your search.</p>}
        </div>

        <p className="text-[12px] text-center" style={{ color: '#B0ACA6' }}>
          Showing {filtered.length} of {residents.length} residents
        </p>
      </div>
      {showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <form onSubmit={event => void addResident(event)} className="w-full max-w-md space-y-3 rounded-xl border p-6 shadow-xl" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}>
          <h2 className="text-[18px] font-semibold" style={{ color: '#1A1917' }}>{editingResident ? 'Edit Resident' : 'Add Resident'}</h2>
          {['name', 'unit', 'phone', 'email', 'maintenance'].map(field => <label key={field} className="block text-[12px] font-semibold capitalize" style={{ color: '#4A4843' }}>{field}
            <input name={field} required disabled={field === 'unit' && Boolean(editingResident)} defaultValue={field === 'name' ? editingResident?.name : field === 'unit' ? editingResident?.unit : field === 'phone' ? editingResident?.phone : field === 'email' ? editingResident?.email : field === 'maintenance' ? editingResident?.maintenance : undefined} type={field === 'email' ? 'email' : field === 'maintenance' ? 'number' : 'text'} min={field === 'maintenance' ? 1 : undefined} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal disabled:bg-gray-100" style={{ borderColor: '#D8D5CE', color: '#1A1917' }} />
          </label>)}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => { setShowAdd(false); setEditingResident(null) }} className="rounded-lg border px-4 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>Cancel</button><button disabled={saving} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#4F46E5' }}>{saving ? 'Saving...' : editingResident ? 'Update Resident' : 'Save Resident'}</button></div>
        </form>
      </div>}
    </div>
  )
}
