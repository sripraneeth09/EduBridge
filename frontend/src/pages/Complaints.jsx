import React, { useEffect, useState } from 'react'
import api from '../services/api'

const categoryIcons = { teacher:'👩‍🏫', meal:'🍱', cleanliness:'🧹', infrastructure:'🏗️', other:'💬' }
const statusSteps = ['pending','under review','in progress','resolved']

function StatusTimeline({ status }){
  const cur = statusSteps.indexOf(status)
  return (
    <div className="eb-timeline my-2">
      {statusSteps.map((step,i)=>(
        <div key={step} className={`eb-timeline-step ${i < cur ? 'done' : i === cur ? 'current' : ''}`}>
          {step.replace(' ','\n')}
        </div>
      ))}
    </div>
  )
}

const statusBadge = s =>
  s==='resolved'    ? 'eb-badge-present' :
  s==='in progress' ? 'eb-badge-progress' :
  s==='under review'? 'eb-badge-review'  : 'eb-badge-pending'

export default function Complaints(){
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState('other')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [message, setMessage]     = useState('')
  const [msgType, setMsgType]     = useState('info')
  const [commentsMap, setCommentsMap] = useState({})
  const [loading, setLoading]     = useState(true)

  const notify = (msg, type='info') => { setMessage(msg); setMsgType(type) }

  const loadComplaints = async () => {
    setLoading(true)
    try { const res = await api.get('/complaints'); setComplaints(res.data) }
    catch { notify('Error loading complaints.','error') }
    finally { setLoading(false) }
  }
  useEffect(()=>{ loadComplaints() },[])

  const submitComplaint = async e => {
    e.preventDefault()
    try {
      await api.post('/complaints', {title, category, description, anonymous})
      setTitle(''); setDescription(''); setAnonymous(false)
      notify('✅ Complaint submitted. You can track its status below.','success')
      loadComplaints()
    } catch { notify('Error submitting complaint.','error') }
  }

  const updateStatus = async (id, status) => {
    try { await api.put(`/complaints/${id}/status`,{status}); notify('Status updated.','info'); loadComplaints() }
    catch { notify('Error updating status.','error') }
  }

  const handleCommentChange = (id, text) => setCommentsMap(prev=>({...prev,[id]:text}))

  const submitComment = async (e, id) => {
    e.preventDefault()
    const text = commentsMap[id]
    if(!text?.trim()) return
    try { await api.post(`/complaints/${id}/comment`,{text}); setCommentsMap(prev=>({...prev,[id]:''})); notify('Comment posted.','info'); loadComplaints() }
    catch { notify('Error posting comment.','error') }
  }

  const isAdminOrTeacher = user.role==='admin'||user.role==='teacher'

  return (
    <div className="container py-5">
      <div className="eb-page-header animate-fade-up">
        <h2>📣 Complaints &amp; Suggestions</h2>
        <p>Submit concerns about school facilities, meals, or teaching. Admins review and track status transparently.</p>
      </div>

      {message && <div className={`eb-alert eb-alert-${msgType==='error'?'error':msgType==='success'?'success':'info'} mb-4 animate-fade`}>{message}</div>}

      <div className="row g-4 mt-1">
        {/* Submit Form */}
        {!isAdminOrTeacher && (
          <div className="col-lg-5 animate-fade-up delay-1">
            <div className="eb-card p-4">
              <h5 style={{fontWeight:700}} className="mb-3">📝 File a Complaint</h5>
              <form onSubmit={submitComplaint}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" placeholder="Brief summary of your concern" value={title} onChange={e=>setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e=>setCategory(e.target.value)}>
                    <option value="teacher">👩‍🏫 Teacher / Academic Related</option>
                    <option value="meal">🍱 Mid-Day Meal Related</option>
                    <option value="cleanliness">🧹 Cleanliness &amp; Hygiene</option>
                    <option value="infrastructure">🏗️ Infrastructure Damage</option>
                    <option value="other">💬 Other Suggestions</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4} placeholder="Describe your grievance in detail…" value={description} onChange={e=>setDescription(e.target.value)} required />
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="anonCheck" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} />
                  <label className="form-check-label text-muted small" htmlFor="anonCheck">
                    Submit Anonymously (Admin won't see your name)
                  </label>
                </div>
                <button className="eb-btn-primary btn w-100">Submit Grievance</button>
              </form>
            </div>
          </div>
        )}

        {/* Complaints list */}
        <div className={isAdminOrTeacher ? 'col-12' : 'col-lg-7'}>
          <div className="eb-card p-4">
            <h5 style={{fontWeight:700}} className="mb-3">
              {isAdminOrTeacher ? '🏛️ School Grievances Board' : '📋 Your Filed Grievances'}
            </h5>
            {loading ? (
              <div className="d-flex flex-column gap-3">
                {[1,2,3].map(i=><div key={i} className="eb-skeleton" style={{height:100,borderRadius:12}}/>)}
              </div>
            ) : complaints.length ? (
              <div className="d-flex flex-column gap-3">
                {complaints.map(comp=>(
                  <div key={comp._id} className="animate-fade" style={{border:'1px solid #e2e8f0',borderRadius:14,padding:'1.25rem',background:'#fff'}}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span style={{fontWeight:700,fontSize:'0.97rem'}}>{comp.title}</span>
                          <span style={{background:'#f1f5f9',borderRadius:20,fontSize:'0.72rem',fontWeight:700,padding:'0.2rem 0.6rem',color:'#475569'}}>
                            {categoryIcons[comp.category]||'💬'} {comp.category}
                          </span>
                        </div>
                        <div className="text-muted small mb-2">
                          {new Date(comp.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} · by{' '}
                          {comp.anonymous
                            ? <span style={{color:'var(--brand-warning)',fontWeight:600}}>Anonymous</span>
                            : <span style={{fontWeight:600}}>{comp.createdBy?.name||'User'}</span>}
                        </div>
                        <p className="text-muted small mb-2" style={{whiteSpace:'pre-line'}}>{comp.description}</p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className={`eb-badge ${statusBadge(comp.status)}`}>{comp.status}</span>
                        {isAdminOrTeacher && (
                          <select className="form-select form-select-sm" style={{width:'auto',minWidth:130,fontSize:'0.8rem'}}
                            value={comp.status} onChange={e=>updateStatus(comp._id, e.target.value)}>
                            {statusSteps.map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Status timeline */}
                    <StatusTimeline status={comp.status} />

                    {/* Comments */}
                    <div style={{background:'#f8fafc',borderRadius:10,padding:'0.85rem',marginTop:'0.75rem'}}>
                      <div style={{fontWeight:700,fontSize:'0.8rem',color:'#475569',marginBottom:'0.5rem'}}>
                        💬 Progress Updates
                      </div>
                      {comp.comments?.length ? (
                        <div className="d-flex flex-column gap-2 mb-2">
                          {comp.comments.map((c,i)=>(
                            <div key={i} style={{fontSize:'0.83rem',paddingBottom:'0.4rem',borderBottom:'1px solid #e2e8f0'}}>
                              <strong>{c.by?.name||'Staff'}: </strong>
                              <span className="text-muted">{c.text}</span>
                              <span className="d-block text-muted" style={{fontSize:'0.7rem'}}>{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="small text-muted mb-2">No updates posted yet.</p>}
                      {isAdminOrTeacher && (
                        <form onSubmit={e=>submitComment(e,comp._id)} className="d-flex gap-2 mt-1">
                          <input className="form-control form-control-sm" placeholder="Post a progress update…"
                            value={commentsMap[comp._id]||''} onChange={e=>handleCommentChange(comp._id, e.target.value)} required />
                          <button className="eb-btn-primary btn btn-sm px-3" style={{whiteSpace:'nowrap'}}>Post</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📭</div>
                <p>No complaints recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
