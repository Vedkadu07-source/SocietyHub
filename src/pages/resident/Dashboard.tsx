import { useEffect, useState } from 'react'
import { api, type ResidentDashboard as ResidentDashboardData } from '../../lib/api'

export default function ResidentDashboard({ userName }: { userName: string }) {
  const [dashboard, setDashboard] = useState<ResidentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getResidentDashboard()
      .then(setDashboard)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load your dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-[14px]" style={{ color: '#6B6660' }}>Loading your home...</div>
  if (error || !dashboard) return <div role="alert" className="p-8 text-[14px]" style={{ color: '#B91C1C' }}>{error || 'Unable to load your dashboard.'}</div>
  const currentPayment = dashboard.currentPayment

  return (
    <div>
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>RESIDENT PORTAL</p>
        <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>Good day, {userName.split(' ')[0]}</h1>
        <p className="text-[14px] mt-1" style={{ color: '#6B6660' }}>Here is what is happening at your home.</p>
      </div>
      <div className="px-6 md:px-8 py-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border p-6" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          <p className="text-[10.5px] font-semibold tracking-widest mb-3" style={{ color: '#9A9591' }}>LATEST PAYMENT</p>
          {currentPayment ? <>
            <p className="text-2xl font-semibold" style={{ color: '#1A1917' }}>₹{currentPayment.amount.toLocaleString('en-IN')}</p>
            <p className="text-[13px] mt-1" style={{ color: '#6B6660' }}>{currentPayment.month} · {currentPayment.status}</p>
          </> : <p className="text-[13px]" style={{ color: '#6B6660' }}>No payment records yet.</p>}
        </section>
        <section className="rounded-xl border p-6" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          <p className="text-[10.5px] font-semibold tracking-widest mb-3" style={{ color: '#9A9591' }}>SERVICE REQUESTS</p>
          <p className="text-2xl font-semibold" style={{ color: '#1A1917' }}>{dashboard.complaints.length}</p>
          <p className="text-[13px] mt-1" style={{ color: '#6B6660' }}>requests on record</p>
        </section>
        <section className="md:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#E5E2DC' }}><h2 className="text-[14px] font-semibold" style={{ color: '#1A1917' }}>Latest community notices</h2></div>
          {dashboard.notices.slice(0, 3).map((notice, index) => <div key={notice.id} className={`px-5 py-4 ${index > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0EDE8' }}>
            <p className="text-[13px] font-semibold" style={{ color: '#1A1917' }}>{notice.title}</p>
            <p className="text-[12.5px] mt-1" style={{ color: '#6B6660' }}>{notice.preview}</p>
          </div>)}
        </section>
      </div>
    </div>
  )
}