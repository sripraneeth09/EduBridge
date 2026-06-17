import React, { useEffect, useState } from 'react'
import { listNotices, createNotice, deleteNotice } from '../services/noticeService'

const categoryColors = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#7c3aed','#be185d']

export default function Notices(){
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [notices, setNotices]       = useState([])
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage]       = useState('')
  const [msgType, setMsgType]       = useState('info')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const notify = (msg, type='info') => { setMessage(msg); setMsgType(type) }

  const loadNotices = () => {
    setLoading(true)
    listNotices().then(r=>setNotices(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(()=>{ loadNotices() },[])

  const submitNotice = async e => {
    e.preventDefault(); setSubmitting(true)
    try { await createNotice({title, description}); setTitle(''); setDescription(''); notify('✅ Notice published successfully.','success'); loadNotices() }
    catch { notify('Error creating notice.','error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    if(!window.confirm('Delete this notice?')) return
    try { await deleteNotice(id); notify('Notice deleted.','info'); loadNotices() }
    catch { notify('Error deleting notice.','error') }
  }

  const canManage = user.role==='admin'||user.role==='teacher'

  return (
    <div className="container py-5">
      <div className="eb-page-header animate-fade-up">
        <h2>📋 School Notice Board</h2>
        <p>Stay updated with latest announcements, academic schedules, and exam updates.</p>
      </div>

      {message && <div className={`eb-alert eb-alert-${msgType==='error'?'error':msgType==='success'?'success':'info'} mb-4 animate-fade`}>{message}</div>}

      {/* Create Notice */}
      {canManage && (
        <div className="eb-card p-4 mb-5 animate-fade-up">
          <h5 style={{fontWeight:700}} className="mb-3">📣 Create Announcement</h5>
          <form onSubmit={submitNotice} className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Notice Title</label>
              <input className="form-control" placeholder="e.g. Annual Sports Day – 25th June" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div className="col-md-12">
              <label className="form-label">Content</label>
              <textarea className="form-control" rows={3} placeholder="Write the full notice content here…" value={description} onChange={e=>setDescription(e.target.value)} required />
            </div>
            <div className="col-12">
              <button className="eb-btn-primary btn" disabled={submitting}>
                {submitting ? <><span className="eb-spinner"/>Publishing…</> : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices grid */}
      {loading ? (
        <div className="row g-3">
          {[1,2,3,4].map(i=>(
            <div key={i} className="col-md-6">
              <div className="eb-skeleton" style={{height:140,borderRadius:14}}/>
            </div>
          ))}
        </div>
      ) : notices.length ? (
        <div className="row g-3">
          {notices.map((n,i)=>{
            const accentColor = categoryColors[i % categoryColors.length]
            const dateObj = new Date(n.date||n.createdAt)
            return (
              <div key={n._id} className={`col-md-6 animate-fade-up delay-${Math.min(i%4+1,8)}`}>
                <div className="eb-notice-card h-100" style={{borderLeftColor:accentColor}}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 pe-3">
                      <h6 style={{fontWeight:700,marginBottom:'0.2rem',color:'#0f172a'}}>{n.title}</h6>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span style={{width:8,height:8,borderRadius:'50%',background:accentColor,display:'inline-block',flexShrink:0}}/>
                        <small style={{color:'#94a3b8',fontSize:'0.75rem'}}>
                          {dateObj.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                          {' at '}
                          {dateObj.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </small>
                      </div>
                    </div>
                    {canManage && (
                      <button onClick={()=>handleDelete(n._id)}
                        className="btn btn-sm btn-outline-danger py-0 px-2" style={{borderRadius:8,fontSize:'0.78rem',flexShrink:0}}>
                        Delete
                      </button>
                    )}
                  </div>
                  <p style={{color:'#475569',fontSize:'0.88rem',lineHeight:1.7,whiteSpace:'pre-line',marginBottom:0}}>{n.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-5 text-muted animate-fade-up">
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>📭</div>
          <h5>No announcements yet</h5>
          <p>{canManage ? 'Create the first notice above.' : 'Check back later for school announcements.'}</p>
        </div>
      )}
    </div>
  )
}
