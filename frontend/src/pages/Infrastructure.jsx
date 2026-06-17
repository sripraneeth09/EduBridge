import React, { useEffect, useState } from 'react'
import api from '../services/api'

const priorityBadge = p =>
  p==='critical'?'eb-badge-absent':p==='high'?'eb-badge-high':p==='medium'?'eb-badge-medium':'eb-badge-low'
const statusBadge = s =>
  s==='resolved'?'eb-badge-present':s==='in progress'?'eb-badge-progress':s==='assigned'?'eb-badge-assigned':'eb-badge-absent'
const priorityIcon = p =>
  p==='critical'?'🔴':p==='high'?'🟠':p==='medium'?'🟡':'🟢'

const statusFlow = ['open','assigned','in progress','resolved']

export default function Infrastructure(){
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation]     = useState('')
  const [priority, setPriority]     = useState('low')
  const [issues, setIssues]         = useState([])
  const [maintenanceStaff, setMaintenanceStaff] = useState([])
  const [message, setMessage]       = useState('')
  const [msgType, setMsgType]       = useState('info')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const notify = (msg, type='info') => { setMessage(msg); setMsgType(type) }

  const loadIssues = async () => {
    setLoading(true)
    try { const res = await api.get('/infrastructure'); setIssues(res.data) }
    catch { notify('Error loading infrastructure reports.','error') }
    finally { setLoading(false) }
  }
  const loadMaintenanceUsers = async () => {
    if(user.role!=='admin') return
    try { const res = await api.get('/users'); setMaintenanceStaff(res.data.filter(u=>u.role==='maintenance')) }
    catch {}
  }

  useEffect(()=>{ loadIssues(); loadMaintenanceUsers() },[])

  const submitReport = async e => {
    e.preventDefault(); setSubmitting(true)
    try { await api.post('/infrastructure',{title,description,location,priority}); setTitle(''); setDescription(''); setLocation(''); setPriority('low'); notify('✅ Issue reported successfully.','success'); loadIssues() }
    catch { notify('Error reporting infrastructure issue.','error') }
    finally { setSubmitting(false) }
  }

  const updateIssueDetails = async (id, payload) => {
    try { await api.put(`/infrastructure/${id}`, payload); notify('Updated successfully.','info'); loadIssues() }
    catch { notify('Error updating issue.','error') }
  }

  const isStaff = user.role==='admin'||user.role==='maintenance'||user.role==='teacher'
  const canReport = user.role==='student'

  return (
    <div className="container py-5">
      <div className="eb-page-header animate-fade-up">
        <h2>🔧 Infrastructure Reporting</h2>
        <p>Report facility damage (desks, fans, leaks) and track repair progress from open to resolved.</p>
      </div>

      {message && <div className={`eb-alert eb-alert-${msgType==='error'?'error':msgType==='success'?'success':'info'} mb-4 animate-fade`}>{message}</div>}

      <div className="row g-4 mt-1">
        {/* Report Form */}
        {canReport && (
          <div className="col-lg-4 animate-fade-up delay-1">
            <div className="eb-card p-4">
              <h5 style={{fontWeight:700}} className="mb-3">📋 Report Damaged Facility</h5>
              <form onSubmit={submitReport}>
                <div className="mb-3">
                  <label className="form-label">Issue Title</label>
                  <input className="form-control" placeholder="e.g. Broken Fan in Room 204" value={title} onChange={e=>setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input className="form-control" placeholder="e.g. Classroom 104" value={location} onChange={e=>setLocation(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={priority} onChange={e=>setPriority(e.target.value)}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Describe the damage or repair needed…" value={description} onChange={e=>setDescription(e.target.value)} required />
                </div>
                <button className="eb-btn-primary btn w-100" disabled={submitting}>
                  {submitting ? <><span className="eb-spinner"/>Submitting…</> : 'Report Issue'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Issues Board */}
        <div className={canReport ? 'col-lg-8' : 'col-12'}>
          <div className="eb-card p-4">
            <h5 style={{fontWeight:700}} className="mb-3">🏗️ Maintenance Status Board</h5>
            {loading ? (
              <div className="d-flex flex-column gap-3">
                {[1,2,3].map(i=><div key={i} className="eb-skeleton" style={{height:120,borderRadius:12}}/>)}
              </div>
            ) : issues.length ? (
              <div className="d-flex flex-column gap-3" style={{maxHeight:640,overflowY:'auto'}}>
                {issues.map(issue => {
                  const isAssignedToMe = issue.assignedTo?._id === (user.id||user._id)
                  const canMaintChange = user.role==='maintenance' && isAssignedToMe
                  const isAdmin = user.role==='admin'
                  return (
                    <div key={issue._id} style={{border:'1px solid #e2e8f0',borderRadius:14,padding:'1.25rem',background:'#fff'}}>
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span>{priorityIcon(issue.priority)}</span>
                            <span style={{fontWeight:700,fontSize:'0.97rem'}}>{issue.title}</span>
                            <span className={`eb-badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
                          </div>
                          <div className="text-muted small mb-2">
                            📍 <strong>{issue.location||'—'}</strong> · Reported {new Date(issue.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                          </div>
                          <p className="text-muted small mb-2">{issue.description}</p>
                          <div className="text-muted small">
                            Assigned to: <strong style={{color: issue.assignedTo?'var(--brand-primary)':'#94a3b8'}}>
                              {issue.assignedTo?.name||'Unassigned'}
                            </strong>
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-end gap-2">
                          <span className={`eb-badge ${statusBadge(issue.status)}`}>{issue.status}</span>

                          {/* Admin controls */}
                          {isAdmin && (
                            <div style={{background:'#f8fafc',borderRadius:10,padding:'0.75rem',minWidth:190}}>
                              <div className="mb-2">
                                <label style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Assign Staff</label>
                                <select className="form-select form-select-sm mt-1"
                                  value={issue.assignedTo?._id||''}
                                  onChange={e=>updateIssueDetails(issue._id,{assignedTo:e.target.value||null, status:e.target.value?'assigned':'open'})}>
                                  <option value="">Unassigned</option>
                                  {maintenanceStaff.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                              </div>
                              <div className="mb-2">
                                <label style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Status</label>
                                <select className="form-select form-select-sm mt-1"
                                  value={issue.status}
                                  onChange={e=>updateIssueDetails(issue._id,{status:e.target.value})}>
                                  {statusFlow.map(s=><option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Priority</label>
                                <select className="form-select form-select-sm mt-1"
                                  value={issue.priority}
                                  onChange={e=>updateIssueDetails(issue._id,{priority:e.target.value})}>
                                  {['low','medium','high','critical'].map(p=><option key={p} value={p}>{priorityIcon(p)} {p}</option>)}
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Maintenance staff controls */}
                          {canMaintChange && (
                            <div style={{background:'#f8fafc',borderRadius:10,padding:'0.75rem',minWidth:160}}>
                              <label style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Update Progress</label>
                              <select className="form-select form-select-sm mt-1"
                                value={issue.status}
                                onChange={e=>updateIssueDetails(issue._id,{status:e.target.value})}>
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
              <div className="text-center py-5 text-muted">
                <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🏗️</div>
                <p>No infrastructure issues reported.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
