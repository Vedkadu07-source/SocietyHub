import { useEffect, useState, type FormEvent } from 'react'
import { api, type Notice, type NoticeCategory, type NoticePriority } from '../../lib/api'

const categoryColors: Record<string, { bg: string; text: string; accent: string }> = {
  'Meeting': { bg: '#EEF2FF', text: '#3730A3', accent: '#4F46E5' },
  'Event': { bg: '#FEF9C3', text: '#92400E', accent: '#D97706' },
  'Maintenance': { bg: '#DBEAFE', text: '#1E40AF', accent: '#2563EB' },
  'Policy': { bg: '#DCFCE7', text: '#065F46', accent: '#059669' },
  'Finance': { bg: '#FEE2E2', text: '#991B1B', accent: '#DC2626' },
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [viewing, setViewing] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    const result = await api.getNotices()
    setNotices(result.data)
  }

  useEffect(() => {
    refresh()
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load notices.'))
      .finally(() => setLoading(false))
  }, [])

  const openEditor = (notice: Notice | null = null) => {
    setEditing(notice)
    setEditorOpen(true)
    setMessage('')
  }

  const saveNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const content = String(form.get('content')).trim()
    setSaving(true)
    setError('')
    try {
      const values = {
        title: String(form.get('title')).trim(),
        category: String(form.get('category')) as NoticeCategory,
        priority: String(form.get('priority')) as NoticePriority,
        preview: content.slice(0, 500),
        content,
      }
      if (editing) await api.updateNotice(editing.id, values)
      else await api.createNotice(values)
      await refresh()
      setEditorOpen(false)
      setMessage(editing ? 'Notice updated.' : 'Notice posted.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save notice.')
    } finally {
      setSaving(false)
    }
  }

  const archiveNotice = async (notice: Notice) => {
    setError('')
    try {
      await api.updateNotice(notice.id, { archived: true })
      setNotices(current => current.filter(item => item.id !== notice.id))
      setMessage('Notice archived.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to archive notice.')
    }
  }

  if (loading) return <div className="p-8 text-[14px]" style={{ color: '#6B6660' }}>Loading notices...</div>

  const featured = notices[0]
  const rest = notices.slice(1)

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}>
        <p className="text-[10.5px] font-semibold tracking-widest mb-2" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
          NOTICE BOARD
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-[26px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>
            Community Notices
          </h1>
          <button
            onClick={() => openEditor()}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white hidden md:block"
            style={{ backgroundColor: '#4F46E5' }}
          >
            + Create Notice
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8 space-y-8">
        {error && <p role="alert" className="text-[13px]" style={{ color: '#B91C1C' }}>{error}</p>}
        {message && <p role="status" className="text-[13px]" style={{ color: '#059669' }}>{message}</p>}
        {/* Mobile create button */}
          <button
            onClick={() => openEditor()}
          className="md:hidden w-full py-2.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ backgroundColor: '#4F46E5' }}
        >
          + Create Notice
        </button>

        {/* Featured Notice */}
        {featured && (() => {
          const c = categoryColors[featured.category] || categoryColors['Meeting']
          return (
            <section>
              <p className="text-[10.5px] font-semibold tracking-widest mb-4" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
                LATEST NOTICE
              </p>
              <div
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: '#E5E2DC' }}
              >
                {/* Featured accent bar */}
                <div className="h-1" style={{ backgroundColor: c.accent }} />
                <div className="px-7 py-7" style={{ backgroundColor: '#FFFFFF' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span
                          className="text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded"
                          style={{ backgroundColor: c.bg, color: c.text, letterSpacing: '0.08em' }}
                        >
                          {featured.category.toUpperCase()}
                        </span>
                        {featured.priority === 'High' && (
                          <span className="text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <h2
                        className="text-[22px] leading-snug mb-3"
                        style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}
                      >
                        {featured.title}
                      </h2>
                      <p className="text-[14px] leading-relaxed mb-5" style={{ color: '#4A4843' }}>
                        {featured.preview}
                      </p>
                      <div className="flex items-center gap-4 text-[12px]" style={{ color: '#9A9591' }}>
                        <span>Posted by {featured.author}</span>
                        <span>·</span>
                        <span>{featured.date}</span>
                      </div>
                    </div>
                    <div
                      className="hidden md:flex w-12 h-12 rounded-xl items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: c.bg }}
                    >
                      <span className="text-2xl">
                        {featured.category === 'Meeting' ? '🗓' : featured.category === 'Event' ? '🎉' : featured.category === 'Finance' ? '💰' : '📋'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-5 border-t" style={{ borderColor: '#F0EDE8' }}>
                    <button
                      onClick={() => setViewing(featured)}
                      className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#4F46E5' }}
                    >
                      View Full Notice
                    </button>
                    <button
                      onClick={() => openEditor(featured)}
                      className="px-4 py-2 rounded-lg text-[12.5px] font-medium border transition-all"
                      style={{ borderColor: '#D8D5CE', color: '#3C3A3E' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void archiveNotice(featured)}
                      className="px-4 py-2 rounded-lg text-[12.5px] font-medium border transition-all"
                      style={{ borderColor: '#D8D5CE', color: '#3C3A3E' }}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )
        })()}

        {/* Recent Notices */}
        <section>
          <p className="text-[10.5px] font-semibold tracking-widest mb-5" style={{ color: '#9A9591', letterSpacing: '0.12em' }}>
            RECENT NOTICES
          </p>
          <div className="space-y-0 border rounded-xl overflow-hidden" style={{ borderColor: '#E5E2DC' }}>
            {rest.map((notice, i) => {
              const c = categoryColors[notice.category] || categoryColors['Meeting']
              return (
                <div
                  key={notice.id}
                  className={`sh-table-row cursor-pointer px-6 py-5 flex items-start gap-5 ${i > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFFFF' }}
                >
                  {/* Date column */}
                  <div className="flex-shrink-0 text-center w-10">
                    <p className="text-[18px] font-bold leading-none" style={{ fontFamily: 'var(--font-mono)', color: '#1A1917' }}>
                      {notice.date.split(' ')[0]}
                    </p>
                    <p className="text-[9.5px] font-semibold uppercase mt-0.5" style={{ color: '#9A9591' }}>
                      {notice.date.split(' ')[1]}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch" style={{ backgroundColor: '#E5E2DC' }} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[9.5px] font-semibold tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {notice.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold mb-1" style={{ color: '#1A1917' }}>{notice.title}</p>
                    <p className="text-[12.5px] line-clamp-2" style={{ color: '#6B6660' }}>{notice.preview}</p>
                    <p className="text-[11px] mt-2" style={{ color: '#B0ACA6' }}>By {notice.author}</p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => openEditor(notice)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all"
                    style={{ borderColor: '#D8D5CE', color: '#6B6660' }}
                  >
                    Edit
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>
      {editorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <form onSubmit={event => void saveNotice(event)} className="w-full max-w-lg space-y-4 rounded-xl border p-6 shadow-xl" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}>
          <h2 className="text-[18px] font-semibold" style={{ color: '#1A1917' }}>{editing ? 'Edit Notice' : 'Create Notice'}</h2>
          <label className="block text-[12px] font-semibold" style={{ color: '#4A4843' }}>Title<input name="title" required minLength={4} maxLength={160} defaultValue={editing?.title ?? ''} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-[12px] font-semibold" style={{ color: '#4A4843' }}>Category<select name="category" defaultValue={editing?.category ?? 'Meeting'} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }}>{(['Meeting', 'Event', 'Maintenance', 'Policy', 'Finance'] as NoticeCategory[]).map(value => <option key={value}>{value}</option>)}</select></label><label className="text-[12px] font-semibold" style={{ color: '#4A4843' }}>Priority<select name="priority" defaultValue={editing?.priority ?? 'Normal'} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }}>{(['Normal', 'High', 'Urgent'] as NoticePriority[]).map(value => <option key={value}>{value}</option>)}</select></label></div>
          <label className="block text-[12px] font-semibold" style={{ color: '#4A4843' }}>Notice text<textarea name="content" required minLength={5} maxLength={5000} rows={5} defaultValue={editing?.content ?? ''} className="mt-1 w-full resize-y rounded-lg border px-3 py-2 text-[13px] font-normal" style={{ borderColor: '#D8D5CE' }} /></label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg border px-4 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>Cancel</button><button disabled={saving} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#4F46E5' }}>{saving ? 'Saving...' : 'Save Notice'}</button></div>
        </form>
      </div>}
      {viewing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="notice-detail-title" className="w-full max-w-lg space-y-4 rounded-xl border p-6 shadow-xl" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}>
          <p className="text-[10px] font-semibold tracking-wider" style={{ color: '#9A9591' }}>{viewing.category.toUpperCase()} · {viewing.date}</p>
          <h2 id="notice-detail-title" className="text-[20px] font-semibold" style={{ color: '#1A1917' }}>{viewing.title}</h2>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: '#4A4843' }}>{viewing.content}</p>
          <p className="text-[11px]" style={{ color: '#9A9591' }}>Posted by {viewing.author}</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setViewing(null)} className="rounded-lg border px-4 py-2 text-[13px]" style={{ borderColor: '#D8D5CE' }}>Close</button><button type="button" onClick={() => { setViewing(null); openEditor(viewing) }} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: '#4F46E5' }}>Edit Notice</button></div>
        </section>
      </div>}
    </div>
  )
}
