import { useEffect, useState, type FormEvent } from 'react'
import { api, type Dashboard, type Resident, type Transaction } from '../../lib/api'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Completed': { bg: '#DCFCE7', text: '#059669' },
  'Pending': { bg: '#FEF3C7', text: '#D97706' },
  'Failed': { bg: '#FEE2E2', text: '#DC2626' },
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

function BarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount))
  const chartHeight = 120

  return (
    <div className="flex items-end gap-2 h-[140px] px-1">
      {data.map((d, i) => {
        const barH = Math.round((d.amount / max) * chartHeight)
        const isLatest = i === data.length - 1
        const isMax = d.amount === max
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all relative"
              style={{
                height: `${barH}px`,
                backgroundColor: isLatest ? '#4F46E5' : isMax ? '#818CF8' : '#C7D2FE',
              }}
            >
              {(isLatest || isMax) && (
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold whitespace-nowrap"
                  style={{ color: isLatest ? '#4F46E5' : '#818CF8' }}
                >
                  {(d.amount / 100000).toFixed(1)}L
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium" style={{ color: '#6B82A0' }}>{d.month}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Treasury() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    const [dashboardResult, transactionResult, residentResult] = await Promise.all([api.getDashboard(), api.getTransactions(), api.getResidents()])
    setDashboard(dashboardResult)
    setTransactions(transactionResult.data)
    setResidents(residentResult.data)
  }

  useEffect(() => {
    refresh().catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load treasury.')).finally(() => setLoading(false))
  }, [])

  const recordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      await api.recordPayment({ residentId: String(form.get('residentId')), month: String(form.get('month')), amount: Number(form.get('amount')), mode: String(form.get('mode')) as Transaction['mode'], date: String(form.get('date')), status: 'Paid' })
      await refresh()
      setShowPayment(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to record payment.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px]" style={{ color: '#6B6660' }}>Loading treasury...</div>
  if (error && !dashboard) return <div role="alert" className="p-8 text-[14px]" style={{ color: '#B91C1C' }}>{error}</div>
  if (!dashboard) return null
  const finance = dashboard.finance
  const formatCurrency = (amount: number) => `₹${formatINR(amount)}`
  const currentDate = new Date()
  const asOfDate = currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const firstCollection = dashboard.monthlyCollections[0]
  const lastCollection = dashboard.monthlyCollections[dashboard.monthlyCollections.length - 1]
  const collectionRange = firstCollection && lastCollection
    ? `${firstCollection.shortMonth}–${lastCollection.shortMonth} ${lastCollection.month.slice(-4)}`
    : 'No collection history'
  const outstandingPaymentDates = residents.filter(resident => resident.status !== 'Paid' && resident.lastPayment).map(resident => Date.parse(resident.lastPayment)).filter(Number.isFinite)
  const oldestOutstandingDays = outstandingPaymentDates.length
    ? Math.max(0, Math.floor((currentDate.getTime() - Math.min(...outstandingPaymentDates)) / 86400000))
    : null

  return (
    <div>
      {/* ── Hero ── */}
      <div className="px-8 pt-10 pb-10" style={{ backgroundColor: '#0B1525' }}>
        <p className="text-[10px] font-semibold tracking-widest mb-4" style={{ color: '#6B82A0', letterSpacing: '0.14em' }}>
          SOCIETY TREASURY
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1
              className="text-[30px] md:text-[38px] leading-tight mb-3"
              style={{ fontFamily: 'var(--font-display)', color: '#FFFFFF' }}
            >
              Society Treasury &amp;<br />Maintenance Corpus
            </h1>
            <p className="text-[14px] max-w-md" style={{ color: '#94A3B8' }}>
              Transparent financial management for {dashboard.society?.name ?? 'your society'}. All collections, dues, and reserves — in one place.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: '#6B82A0', letterSpacing: '0.1em' }}>
              TOTAL CORPUS
            </p>
            <p
              className="text-5xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}
            >
              {formatCurrency(finance.corpusBalance)}
            </p>
            <p className="text-[12px] mt-2" style={{ color: '#6B82A0' }}>As of {asOfDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-7">
          <button
            onClick={() => setShowPayment(true)}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#4F46E5' }}
          >
            Record Payment
          </button>
          <button
            disabled
            title="Reminder delivery is not configured"
            className="px-5 py-2.5 rounded-lg text-[13px] font-medium border transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#94A3B8' }}
          >
            Send Payment Reminders
          </button>
        </div>
      </div>

      {/* ── Financial Metrics Row ── */}
      <div className="border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#F3F2EE' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: '#E5E2DC' }}>
          {[
            { label: 'Total Collection', value: formatCurrency(finance.currentMonthCollection), sub: new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }), color: '#1A1917' },
            { label: 'Outstanding Dues', value: formatCurrency(finance.outstandingDues), sub: `${finance.pendingResidents} units`, color: '#D97706' },
            { label: 'Paid Residents', value: String(finance.paidResidents), sub: `of ${dashboard.residents.total}`, color: '#059669' },
            { label: 'Pending Residents', value: String(finance.pendingResidents), sub: `collection rate: ${finance.collectionRate}%`, color: '#DC2626' },
          ].map((m, i) => (
            <div
              key={m.label}
              className={`px-6 py-5 ${i > 0 ? 'border-l' : ''}`}
              style={{ borderColor: '#E5E2DC' }}
            >
              <p className="text-[10.5px] font-semibold tracking-wider mb-2" style={{ color: '#9A9591', letterSpacing: '0.1em' }}>
                {m.label.toUpperCase()}
              </p>
              <p className="text-[22px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: m.color }}>
                {m.value}
              </p>
              <p className="text-[11.5px] mt-1" style={{ color: '#9A9591' }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-8 py-8 space-y-8">
        {/* ── Chart + Insights ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Revenue Trend */}
          <section className="md:col-span-2 rounded-xl border p-6" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#1A1917' }}>Collection Trend</h2>
                <p className="text-[12px] mt-0.5" style={{ color: '#9A9591' }}>Monthly maintenance collection · {collectionRange}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#4F46E5' }} />
                  <span style={{ color: '#9A9591' }}>Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#C7D2FE' }} />
                  <span style={{ color: '#9A9591' }}>Previous</span>
                </div>
              </div>
            </div>
            <BarChart data={dashboard.monthlyCollections.map(item => ({ month: item.shortMonth, amount: item.amount }))} />
          </section>

          {/* Premium Insights */}
          <section className="rounded-xl border p-6" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
            <h2 className="text-[13px] font-semibold mb-4" style={{ color: '#1A1917' }}>Financial Insights</h2>
            <div className="space-y-4">
              {[
                { label: 'Avg monthly collection', value: formatCurrency(dashboard.monthlyCollections.length ? Math.round(dashboard.monthlyCollections.reduce((total, item) => total + item.amount, 0) / dashboard.monthlyCollections.length) : 0), delta: '', up: null },
                { label: 'Maintenance per unit', value: formatCurrency(dashboard.society?.maintenancePerUnit ?? 0), delta: '', up: null },
                { label: 'Collection rate', value: `${finance.collectionRate}%`, delta: '', up: true },
                { label: 'Oldest outstanding payment', value: oldestOutstandingDays === null ? 'None' : `${oldestOutstandingDays} days ago`, delta: '', up: null },
                { label: 'Reserve fund balance', value: formatCurrency(finance.reserveFund), delta: '', up: null },
              ].map((ins) => (
                <div key={ins.label} className="flex items-center justify-between border-b py-2 last:border-0" style={{ borderColor: '#F0EDE8' }}>
                  <p className="text-[12px]" style={{ color: '#6B6660' }}>{ins.label}</p>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>{ins.value}</p>
                    {ins.delta && (
                      <p className="text-[10px] font-medium" style={{ color: ins.up ? '#059669' : '#DC2626' }}>
                        {ins.up ? '↑' : '↓'} {ins.delta}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Transaction Ledger ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: '#1A1917' }}>Financial Activity</h2>
            <button onClick={() => void api.exportTransactions().catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to export transactions.'))} className="text-[12.5px] font-medium" style={{ color: '#4F46E5' }}>Export CSV →</button>
          </div>

          <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E5E2DC' }}>
            <div
              className="grid text-[10.5px] font-semibold tracking-wider px-5 py-3"
              style={{
                color: '#9A9591',
                backgroundColor: '#F9F8F5',
                letterSpacing: '0.08em',
                gridTemplateColumns: '100px 140px 80px 110px 110px 1fr 100px 90px',
                gap: '0 12px',
              }}
            >
              <span>TXN ID</span>
              <span>RESIDENT</span>
              <span>UNIT</span>
              <span>CATEGORY</span>
              <span>MODE</span>
              <span>AMOUNT</span>
              <span>DATE</span>
              <span>STATUS</span>
            </div>

            {transactions.map((t, i) => {
              const sc = statusColors[t.status] || { bg: '#F3F4F6', text: '#6B7280' }
              return (
                <div
                  key={t.id}
                  className={`sh-table-row grid px-5 py-3.5 items-center ${i > 0 ? 'border-t' : ''}`}
                  style={{
                    borderColor: '#F0EDE8',
                    backgroundColor: '#FFFFFF',
                    gridTemplateColumns: '100px 140px 80px 110px 110px 1fr 100px 90px',
                    gap: '0 12px',
                  }}
                >
                  <span className="text-[11px] font-mono" style={{ color: '#9A9591' }}>{t.id}</span>
                  <span className="text-[13px] font-medium" style={{ color: '#1A1917' }}>{t.resident}</span>
                  <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{t.unit}</span>
                  <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{t.category}</span>
                  <span className="text-[12.5px]" style={{ color: '#6B6660' }}>{t.mode}</span>
                  <span className="text-[13.5px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>
                    ₹{formatINR(t.amount)}
                  </span>
                  <span className="text-[12px]" style={{ color: '#9A9591' }}>{t.date}</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >
                    {t.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
      {error && <p role="alert" className="mx-8 mb-4 text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
      {showPayment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <form onSubmit={event => void recordPayment(event)} className="w-full max-w-md space-y-4 rounded-xl border p-6 shadow-xl" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}>
          <h2 className="text-[18px] font-semibold" style={{ color: '#1A1917' }}>Record Payment</h2>
          <label className="block text-[12px] font-semibold" style={{ color: '#4A4843' }}>Resident<select name="residentId" required className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }}>{residents.map(resident => <option key={resident.id} value={resident.id}>{resident.name} · {resident.unit}</option>)}</select></label>
          <label className="block text-[12px] font-semibold" style={{ color: '#4A4843' }}>Month<input name="month" required defaultValue={new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-[12px] font-semibold" style={{ color: '#4A4843' }}>Amount<input name="amount" type="number" min="1" step="0.01" required className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }} /></label><label className="text-[12px] font-semibold" style={{ color: '#4A4843' }}>Payment mode<select name="mode" className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }}>{(['UPI', 'Bank Transfer', 'Net Banking', 'Cheque', 'Cash'] as const).map(mode => <option key={mode}>{mode}</option>)}</select></label></div>
          <label className="block text-[12px] font-semibold" style={{ color: '#4A4843' }}>Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }} /></label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowPayment(false)} className="rounded-lg border px-4 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>Cancel</button><button disabled={saving} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#4F46E5' }}>{saving ? 'Saving...' : 'Record Payment'}</button></div>
        </form>
      </div>}
    </div>
  )
}
