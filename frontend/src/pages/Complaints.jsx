import React, { useEffect, useState } from 'react'
import api from '../services/api'
import {
  MessageSquareWarning, Tag, Send, Inbox, Clock,
  CheckCircle2, RotateCcw, Eye
} from 'lucide-react'

const categoryLabels = {
  teacher:        'Teacher / Academic',
  meal:           'Mid-Day Meal',
  cleanliness:    'Cleanliness & Hygiene',
  infrastructure: 'Infrastructure',
  other:          'Other / Suggestion',
}
const categoryColors = {
  teacher: '#4338ca', meal: '#d97706', cleanliness: '#059669',
  infrastructure: '#0369a1', other: '#7c3aed',
}

const statusSteps = ['pending', 'under review', 'in progress', 'resolved']
const statusBadge = s =>
  s === 'resolved'     ? 'eb-badge-present'  :
  s === 'in progress'  ? 'eb-badge-progress' :
  s === 'under review' ? 'eb-badge-review'   : 'eb-badge-pending'

function StatusTimeline({ status }) {
  const cur = statusSteps.indexOf(status)
  return (
    <div className="eb-timeline my-3">
      {statusSteps.map((step, i) => (
        <div key={step} className={`eb-timeline-step ${i < cur ? 'done' : i === cur ? 'current' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  )
}

export default function Complaints() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [title, setTitle]             = useState('')
  const [category, setCategory]       = useState('other')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous]     = useState(false)
  const [complaints, setComplaints]   = useState([])
  const [message, setMessage]         = useState('')
  const [msgType, setMsgType]         = useState('info')
  const [commentsMap, setCommentsMap] = useState({})
  const [loading, setLoading]         = useState(true)

  const notify = (msg, type = 'info') => { setMessage(msg); setMsgType(type) }

  const loadComplaints = async () => {
    setLoading(true)
    try { const res = await api.get('/complaints'); setComplaints(res.data) }
    catch { notify('Error loading complaints.', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadComplaints() }, [])

  const submitComplaint = async e => {
    e.preventDefault()
    try {
      await api.post('/complaints', { title, category, description, anonymous })
      setTitle(''); setDescription(''); setAnonymous(false)
      notify('Complaint submitted. Track its status below.', 'success')
      loadComplaints()
    } catch { notify('Error submitting complaint.', 'error') }
  }

  const updateStatus = async (id, status) => {
    try { await api.put(`/complaints/${id}/status`, { status }); notify('Status updated.', 'success'); loadComplaints() }
    catch { notify('Error updating status.', 'error') }
  }

  const handleCommentChange = (id, text) => setCommentsMap(prev => ({ ...prev, [id]: text }))

  const submitComment = async (e, id) => {
    e.preventDefault()
    const text = commentsMap[id]
    if (!text?.trim()) return
    try {
      await api.post(`/complaints/${id}/comment`, { text })
      setCommentsMap(prev => ({ ...prev, [id]: '' }))
      notify('Comment posted.', 'success')
      loadComplaints()
    } catch { notify('Error posting comment.', 'error') }
  }

  const isAdminOrTeacher = user.role === 'admin' || user.role === 'teacher'

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="eb-page-header animate-fade-up">
        <div className="d-flex align-items-center gap-2 mb-1">
          <MessageSquareWarning size={20} color="var(--brand-primary-light)" />
          <h2 style={{ margin: 0 }}>Complaints &amp; Suggestions</h2>
        </div>
        <p>Submit concerns about school facilities, meals, or teaching. Track status transparently.</p>
      </div>

      {message && (
        <div className={`eb-alert eb-alert-${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : 'info'} mb-4 animate-fade`}>
          {message}
        </div>
      )}

      <div className="row g-4 mt-1">
        {/* Submit Form — students & parents only */}
        {!isAdminOrTeacher && (
          <div className="col-lg-4 animate-fade-up delay-1">
            <div className="eb-card p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <MessageSquareWarning size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>File a Complaint</h5>
              </div>
              <form onSubmit={submitComplaint}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" placeholder="Brief summary of your concern"
                    value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="teacher">Teacher / Academic Related</option>
                    <option value="meal">Mid-Day Meal Related</option>
                    <option value="cleanliness">Cleanliness &amp; Hygiene</option>
                    <option value="infrastructure">Infrastructure Damage</option>
                    <option value="other">Other / Suggestions</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4}
                    placeholder="Describe your grievance in detail…"
                    value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="d-flex align-items-center gap-2 mb-4 p-3 rounded-3"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => setAnonymous(v => !v)}>
                  <input type="checkbox" id="anonCheck" checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-primary-light)' }} />
                  <label htmlFor="anonCheck" style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Submit anonymously <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(your name won't be shown)</span>
                  </label>
                </div>
                <button className="eb-btn-primary btn w-100" style={{ justifyContent: 'center' }}>
                  <Send size={14} /> Submit Grievance
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Complaints list */}
        <div className={isAdminOrTeacher ? 'col-12' : 'col-lg-8'}>
          <div className="eb-card p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              {isAdminOrTeacher
                ? <><Eye size={16} color="var(--brand-primary-light)" /><h5 style={{ fontWeight: 700, margin: 0 }}>School Grievances Board</h5></>
                : <><Clock size={16} color="var(--brand-primary-light)" /><h5 style={{ fontWeight: 700, margin: 0 }}>Your Filed Grievances</h5></>
              }
              {complaints.length > 0 && (
                <span className="eb-badge eb-badge-pending ms-auto">{complaints.length} total</span>
              )}
            </div>

            {loading ? (
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map(i => <div key={i} className="eb-skeleton" style={{ height: 100, borderRadius: 12 }} />)}
              </div>
            ) : complaints.length ? (
              <div className="d-flex flex-column gap-3">
                {complaints.map(comp => (
                  <div key={comp._id} className="animate-fade"
                    style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', background: 'var(--surface)' }}>

                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
                            {comp.title}
                          </span>
                          <span style={{
                            background: `${categoryColors[comp.category]}18`,
                            color: categoryColors[comp.category] || '#64748b',
                            borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                            padding: '0.2rem 0.65rem', border: `1px solid ${categoryColors[comp.category]}30`,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            <Tag size={10} />
                            {categoryLabels[comp.category] || comp.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {new Date(comp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' · by '}
                          {comp.anonymous
                            ? <span style={{ color: 'var(--brand-warning)', fontWeight: 600 }}>Anonymous</span>
                            : <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{comp.createdBy?.name || 'User'}</span>}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line', marginBottom: 0 }}>
                          {comp.description}
                        </p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2" style={{ flexShrink: 0 }}>
                        <span className={`eb-badge ${statusBadge(comp.status)}`}>{comp.status}</span>
                        {isAdminOrTeacher && (
                          <select className="form-select form-select-sm"
                            style={{ width: 'auto', minWidth: 140, fontSize: '0.8rem' }}
                            value={comp.status}
                            onChange={e => updateStatus(comp._id, e.target.value)}>
                            {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </div>

                    <StatusTimeline status={comp.status} />

                    {/* Comments */}
                    <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '0.9rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                        Progress Updates
                      </div>
                      {comp.comments?.length ? (
                        <div className="d-flex flex-column gap-2 mb-3">
                          {comp.comments.map((c, i) => (
                            <div key={i} style={{ fontSize: '0.84rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{c.by?.name || 'Staff'}: </strong>
                              <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No updates yet.</p>
                      )}
                      {isAdminOrTeacher && (
                        <form onSubmit={e => submitComment(e, comp._id)} className="d-flex gap-2">
                          <input className="form-control form-control-sm" placeholder="Post a progress update…"
                            value={commentsMap[comp._id] || ''}
                            onChange={e => handleCommentChange(comp._id, e.target.value)} required />
                          <button className="eb-btn-primary btn btn-sm px-3"
                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Send size={12} />Post
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                <Inbox size={40} color="#e2e8f0" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No complaints recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
