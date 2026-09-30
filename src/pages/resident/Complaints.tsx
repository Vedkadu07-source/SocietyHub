import { useEffect, useState, type FormEvent } from 'react'
import { api, type Complaint, type ComplaintCategory, type ComplaintPriority } from '../../lib/api'

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = async () => setComplaints((await api.getMyComplaints()).data)

  useEffect(() => {
    refresh().catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load service requests.')).finally(() => setLoading(false))
  }, [])

  const submitComplaint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.createComplaint({
        issue: String(form.get('issue')),
        category: String(form.get('category')) as ComplaintCategory,
        priority: String(form.get('priority')) as ComplaintPriority,
      })
      await refresh()
      formElement.reset()
      setMessage('Your service request was submitted.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit your request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>RESIDENT PORTAL</p>
        <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>Service Requests</h1>
        <p className="text-[14px] mt-1" style={{ color: '#6B6660' }}>Track requests submitted to your society committee.</p>
      </div>
      <div className="px-6 md:px-8 py-6">
        <form onSubmit={event => void submitComplaint(event)} className="mb-5 rounded-xl border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: '#1A1917' }}>New service request</h2>
          <div className="grid gap-3 md:grid-cols-[1fr_170px_140px_auto]">
            <input name="issue" required minLength={5} maxLength={500} placeholder="Describe the issue" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }} />
            <select name="category" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>{(['Plumbing', 'Electrical', 'Civil', 'Lift', 'Security', 'Community'] as ComplaintCategory[]).map(category => <option key={category}>{category}</option>)}</select>
            <select name="priority" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>{(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).map(priority => <option key={priority}>{priority}</option>)}</select>
            <button disabled={saving} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#4F46E5' }}>{saving ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        </form>
        {loading && <p className="mb-3 text-[13px]" style={{ color: '#6B6660' }}>Loading service requests...</p>}
        {error && <p role="alert" className="mb-3 text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        {message && <p role="status" className="mb-3 text-[13px]" style={{ color: '#059669' }}>{message}</p>}
        <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          {complaints.map((complaint, index) => <article key={complaint.id} className={`px-5 py-5 ${index > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0EDE8' }}>
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="text-[14px] font-semibold" style={{ color: '#1A1917' }}>{complaint.issue}</h2>
              <span className="text-[11px] font-semibold px-2 py-1 rounded" style={{ backgroundColor: complaint.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7', color: complaint.status === 'Resolved' ? '#059669' : '#B45309' }}>{complaint.status}</span>
            </div>
            <p className="text-[12px] mt-2" style={{ color: '#9A9591' }}>{complaint.id} · {complaint.unit} · {complaint.date}</p>
            {complaint.response && <p className="text-[12.5px] mt-3" style={{ color: '#6B6660' }}>{complaint.response}</p>}
          </article>)}
          {!loading && !error && complaints.length === 0 && <p className="px-5 py-8 text-center text-[13px]" style={{ color: '#9A9591' }}>No service requests yet.</p>}
        </div>
      </div>
    </div>
  )
}