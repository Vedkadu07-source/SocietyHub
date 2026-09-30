import { useEffect, useState } from 'react'
import { api, type Notice } from '../../lib/api'

export default function ResidentNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getNotices()
      .then(result => setNotices(result.data))
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load notices.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>RESIDENT PORTAL</p>
        <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>Community Notices</h1>
        <p className="text-[14px] mt-1" style={{ color: '#6B6660' }}>Updates from your society committee.</p>
      </div>
      <div className="px-6 md:px-8 py-6">
        {loading && <p className="mb-4 text-[13px]" style={{ color: '#6B6660' }}>Loading notices...</p>}
        {error && <p role="alert" className="mb-4 text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
          {notices.map((notice, index) => <article key={notice.id} className={`px-5 py-5 ${index > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0EDE8' }}>
            <div className="flex flex-wrap items-center gap-2 mb-2"><span className="text-[10px] font-semibold tracking-wider px-2 py-1 rounded" style={{ backgroundColor: '#EEF2FF', color: '#3730A3' }}>{notice.category.toUpperCase()}</span><span className="text-[11px]" style={{ color: '#9A9591' }}>{notice.date}</span></div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#1A1917' }}>{notice.title}</h2>
            <p className="text-[13px] leading-relaxed mt-2" style={{ color: '#6B6660' }}>{notice.preview}</p>
            <p className="text-[11px] mt-3" style={{ color: '#9A9591' }}>Posted by {notice.author}</p>
          </article>)}
          {!loading && !error && notices.length === 0 && <p className="px-5 py-8 text-center text-[13px]" style={{ color: '#9A9591' }}>There are no active notices.</p>}
        </div>
      </div>
    </div>
  )
}