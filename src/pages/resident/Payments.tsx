import { useEffect, useState } from 'react'
import { api, type Payment } from '../../lib/api'

export default function ResidentPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getMyPayments()
      .then(result => setPayments(result.data))
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load payments.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>RESIDENT PORTAL</p>
        <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>Payments</h1>
        <p className="text-[14px] mt-1" style={{ color: '#6B6660' }}>Your maintenance payment history.</p>
      </div>
      <div className="px-6 md:px-8 py-6">
        {loading && <p className="mb-4 text-[13px]" style={{ color: '#6B6660' }}>Loading payments...</p>}
        {error && <p role="alert" className="mb-4 text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          <div className="hidden md:grid px-5 py-3 text-[10.5px] font-semibold tracking-wider" style={{ color: '#9A9591', backgroundColor: '#F9F8F5', gridTemplateColumns: '1fr 1fr 120px 120px 100px' }}><span>PERIOD</span><span>DATE</span><span>MODE</span><span>AMOUNT</span><span>STATUS</span></div>
          {payments.map((payment, index) => <div key={payment.id} className={`grid grid-cols-2 md:px-5 px-4 py-4 gap-2 md:gap-0 md:items-center ${index > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0EDE8' }}>
            <span className="text-[13px] font-medium" style={{ color: '#1A1917' }}>{payment.month}</span><span className="text-[12px]" style={{ color: '#6B6660' }}>{payment.date}</span><span className="text-[12px]" style={{ color: '#6B6660' }}>{payment.mode}</span><span className="text-[13px] font-semibold" style={{ color: '#1A1917' }}>₹{payment.amount.toLocaleString('en-IN')}</span><span className="text-[11px] font-semibold" style={{ color: '#059669' }}>{payment.status}</span>
          </div>)}
          {!loading && !error && payments.length === 0 && <p className="px-5 py-8 text-center text-[13px]" style={{ color: '#9A9591' }}>No payments have been recorded yet.</p>}
        </div>
      </div>
    </div>
  )
}