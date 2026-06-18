import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'
import {
  Wrench, MapPin, AlertTriangle, CheckCircle2, Clock,
  UserCheck, ChevronDown, Inbox, Send, CircleDot
} from 'lucide-react'

const priorityBadge = p =>
  p === 'critical' ? 'eb-badge-absent' :
  p === 'high'     ? 'eb-badge-high'   :
  p === 'medium'   ? 'eb-badge-medium' : 'eb-badge-low'

const statusBadge = s =>
  s === 'resolved'    ? 'eb-badge-present'  :
  s === 'in progress' ? 'eb-badge-progress' :
  s === 'assigned'    ? 'eb-badge-assigned' : 'eb-badge-pending'

const priorityDot = p => {
  const colors = { critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }
  return <CircleDot size={12} color={colors[p] || '#94a3b8'} />
}

const statusFlow = ['open', 'assigned', 'in progress', 'resolved']

export default function Infrastructure() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  if (user.role === 'teacher') {
    return <Navigate to="/dashboard" replace />
  }
  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [location, setLocation]         = useState('')
  const [priority, setPriority]         = useState('low')
  const [issues, setIssues]             = useState([])
  const [maintenanceStaff, setMaintenanceStaff] = useState([])
  const [message, setMessage]           = useState('')
  const [msgType, setMsgType]           = useState('info')
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)

  const notify = (msg, type = 'info') => { setMessage(msg); setMsgType(type) }

  const loadIssues = async () => {
    setLoading(true)
    try {
      const res = await api.get('/infrastructure')
      setIssues(res.data)
    } catch { notify('Error loading infrastructure reports.', 'error') }
    finally { setLoading(false) }
  }

  const loadMaintenanceUsers = async () => {
    if (user.role !== 'admin') return
    try {
      const res = await api.get('/users')
      setMaintenanceStaff(res.data.filter(u => u.role === 'maintenance'))
    } catch {}
  }

  useEffect(() => { loadIssues(); loadMaintenanceUsers() }, [])

  const submitReport = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/infrastructure', { title, description, location, priority })
      setTitle(''); setDescription(''); setLocation(''); setPriority('low')
      notify('Issue reported successfully.', 'success')
      loadIssues()
    } catch { notify('Error reporting infrastructure issue.', 'error') }
    finally { setSubmitting(false) }
  }

  const updateIssueDetails = async (id, payload) => {
    try {
      await api.put(`/infrastructure/${id}`, payload)
      notify('Updated successfully.', 'success')
      loadIssues()
    } catch { notify('Error updating issue.', 'error') }
  }

  const canReport = user.role === 'student'
  const isAdmin   = user.role === 'admin'
  const isMaint   = user.role === 'maintenance'

  // Stats
  const open       = issues.filter(i => i.status === 'open').length
  const inProgress = issues.filter(i => i.status === 'in progress').length
  const resolved   = issues.filter(i => i.status === 'resolved').length

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="eb-page-header animate-fade-up">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Wrench size={20} color="var(--brand-primary-light)" />
          <h2 style={{ margin: 0 }}>Infrastructure Reporting</h2>
        </div>
        <p>Report facility damage and track repair progress from open to resolved.</p>
      </div>

      {/* Stats row — staff/admin */}
      {(isAdmin || isMaint) && issues.length > 0 && (
        <div className="row g-3 mb-4 animate-fade-up">
          {[
            { label: 'Open',        value: open,       bg: '#fee2e2', color: '#dc2626' },
            { label: 'In Progress', value: inProgress, bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Resolved',    value: resolved,   bg: '#dcfce7', color: '#15803d' },
            { label: 'Total',       value: issues.length, bg: '#f1f5f9', color: '#475569' },
          ].map(s => (
            <div key={s.label} className="col-6 col-md-3">
              <div style={{ background: s.bg, borderRadius: 12, padding: '1rem', border: '1px solid rgba(0,0,0,.05)' }}>
                <div style={{ fontWeight: 800, fontSize: '1.6rem', color: s.color, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color, opacity: 0.75, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={`eb-alert eb-alert-${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : 'info'} mb-4 animate-fade`}>
          {message}
        </div>
      )}

      <div className="row g-4 mt-1">
        {/* Report Form — students only */}
        {canReport && (
          <div className="col-lg-4 animate-fade-up delay-1">
            <div className="eb-card p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <AlertTriangle size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>Report an Issue</h5>
              </div>
              <form onSubmit={submitReport}>
                <div className="mb-3">
                  <label className="form-label">Issue Title</label>
                  <input className="form-control" placeholder="e.g. Broken Fan in Room 204"
                    value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-control" placeholder="e.g. Classroom 104"
                      value={location} onChange={e => setLocation(e.target.value)}
                      required style={{ paddingLeft: '2.25rem' }} />
                    <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="low">Low — Minor inconvenience</option>
                    <option value="medium">Medium — Affects daily use</option>
                    <option value="high">High — Urgent repair needed</option>
                    <option value="critical">Critical — Safety hazard</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3}
                    placeholder="Describe the damage or repair needed in detail…"
                    value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <button className="eb-btn-primary btn w-100" disabled={submitting} style={{ justifyContent: 'center' }}>
                  {submitting
                    ? <><span className="eb-spinner" />Submitting…</>
                    : <><Send size={14} />Submit Report</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Issues Board */}
        <div className={canReport ? 'col-lg-8' : 'col-12'}>
          <div className="eb-card p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Wrench size={16} color="var(--brand-primary-light)" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Maintenance Status Board</h5>
            </div>

            {loading ? (
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map(i => <div key={i} className="eb-skeleton" style={{ height: 120, borderRadius: 12 }} />)}
              </div>
            ) : issues.length ? (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: 640, overflowY: 'auto', paddingRight: 4 }}>
                {issues.map(issue => {
                  const isAssignedToMe = issue.assignedTo?._id === (user.id || user._id)
                  const canMaintChange = isMaint && isAssignedToMe

                  return (
                    <div key={issue._id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', background: 'var(--surface)', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div className="flex-grow-1">
                          {/* Title row */}
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            {priorityDot(issue.priority)}
                            <span style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
                              {issue.title}
                            </span>
                            <span className={`eb-badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
                          </div>

                          {/* Meta */}
                          <div className="d-flex align-items-center gap-3 flex-wrap mb-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span className="d-flex align-items-center gap-1">
                              <MapPin size={11} />
                              {issue.location || '—'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={11} />
                              Reported {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <UserCheck size={11} />
                              <span style={{ color: issue.assignedTo ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: issue.assignedTo ? 600 : 400 }}>
                                {issue.assignedTo?.name || 'Unassigned'}
                              </span>
                            </span>
                          </div>

                          {issue.description && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 0 }}>
                              {issue.description}
                            </p>
                          )}
                        </div>

                        {/* Right controls */}
                        <div className="d-flex flex-column align-items-end gap-2" style={{ flexShrink: 0 }}>
                          <span className={`eb-badge ${statusBadge(issue.status)}`}>{issue.status}</span>

                          {/* Admin controls */}
                          {isAdmin && (
                            <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '0.9rem', minWidth: 200, border: '1px solid var(--border)' }}>
                              <div className="mb-2">
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
                                  Assign Staff
                                </label>
                                <select className="form-select form-select-sm"
                                  value={issue.assignedTo?._id || ''}
                                  onChange={e => updateIssueDetails(issue._id, {
                                    assignedTo: e.target.value || null,
                                    status: e.target.value ? 'assigned' : 'open',
                                  })}>
                                  <option value="">Unassigned</option>
                                  {maintenanceStaff.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="mb-2">
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
                                  Status
                                </label>
                                <select className="form-select form-select-sm"
                                  value={issue.status}
                                  onChange={e => updateIssueDetails(issue._id, { status: e.target.value })}>
                                  {statusFlow.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
                                  Priority
                                </label>
                                <select className="form-select form-select-sm"
                                  value={issue.priority}
                                  onChange={e => updateIssueDetails(issue._id, { priority: e.target.value })}>
                                  {['low', 'medium', 'high', 'critical'].map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Maintenance controls */}
                          {canMaintChange && (
                            <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '0.9rem', minWidth: 170, border: '1px solid var(--border)' }}>
                              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
                                Update Progress
                              </label>
                              <select className="form-select form-select-sm"
                                value={issue.status}
                                onChange={e => updateIssueDetails(issue._id, { status: e.target.value })}>
                                <option value="assigned">Assigned</option>
                                <option value="in progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                <Wrench size={40} color="#e2e8f0" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No infrastructure issues reported yet.</p>
                {canReport && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Use the form on the left to report a facility issue.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
