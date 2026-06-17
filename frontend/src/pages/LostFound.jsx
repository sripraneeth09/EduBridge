import React, { useEffect, useState } from 'react'
import api from '../services/api'

const lostStatusBadge = s => s==='lost' ? 'eb-badge-absent' : s==='claimed' ? 'eb-badge-review' : 'eb-badge-present'
const foundStatusBadge = s => s==='found' ? 'eb-badge-assigned' : s==='claimed' ? 'eb-badge-review' : 'eb-badge-present'

const getPotentialMatches = (lostItem, foundItems) => {
  const term = lostItem.itemName.trim().toLowerCase()
  if(!term) return []
  return foundItems.filter(f =>
    f.status==='found' &&
    (f.itemName.toLowerCase().includes(term) || term.includes(f.itemName.toLowerCase()))
  )
}

export default function LostFound(){
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [lostName, setLostName]   = useState('')
  const [lostDesc, setLostDesc]   = useState('')
  const [foundName, setFoundName] = useState('')
  const [foundDesc, setFoundDesc] = useState('')
  const [foundLoc, setFoundLoc]   = useState('')
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [message, setMessage]     = useState('')
  const [msgType, setMsgType]     = useState('info')
  const [loading, setLoading]     = useState(true)

  const notify = (msg, type='info') => { setMessage(msg); setMsgType(type) }

  const loadData = async () => {
    setLoading(true)
    try {
      const [lRes, fRes] = await Promise.all([api.get('/lostfound/lost'), api.get('/lostfound/found')])
      setLostItems(lRes.data); setFoundItems(fRes.data)
    } catch { notify('Error loading lost & found records.','error') }
    finally { setLoading(false) }
  }
  useEffect(()=>{ loadData() },[])

  const submitLost = async e => {
    e.preventDefault()
    try { await api.post('/lostfound/lost',{itemName:lostName, description:lostDesc}); setLostName(''); setLostDesc(''); notify('✅ Lost item reported.','success'); loadData() }
    catch { notify('Error reporting lost item.','error') }
  }
  const submitFound = async e => {
    e.preventDefault()
    try { await api.post('/lostfound/found',{itemName:foundName, description:foundDesc, locationFound:foundLoc}); setFoundName(''); setFoundDesc(''); setFoundLoc(''); notify('✅ Found item reported.','success'); loadData() }
    catch { notify('Error reporting found item.','error') }
  }
  const claimItem = async id => {
    try { await api.post(`/lostfound/found/${id}/claim`); notify('Item claimed! Contact school administrator to retrieve it.','success'); loadData() }
    catch { notify('Error claiming item.','error') }
  }
  // Bug fix: use item._id consistently
  const updateLostStatus = async (id, status) => {
    try { await api.put(`/lostfound/lost/${id}/status`,{status}); notify('Lost item status updated.','info'); loadData() }
    catch { notify('Error updating status.','error') }
  }
  const updateFoundStatus = async (id, status) => {
    try { await api.put(`/lostfound/found/${id}/status`,{status}); notify('Found item status updated.','info'); loadData() }
    catch { notify('Error updating status.','error') }
  }
  const deleteLost = async id => {
    try { await api.delete(`/lostfound/lost/${id}`); notify('Lost item deleted.','info'); loadData() }
    catch { notify('Error deleting item.','error') }
  }
  const deleteFound = async id => {
    try { await api.delete(`/lostfound/found/${id}`); notify('Found item deleted.','info'); loadData() }
    catch { notify('Error deleting item.','error') }
  }

  const isStaff = user.role==='admin'||user.role==='maintenance'||user.role==='teacher'

  return (
    <div className="container py-5">
      <div className="eb-page-header animate-fade-up">
        <h2>🔍 Lost &amp; Found Management</h2>
        <p>Register misplaced items, report found items, and use the smart matching engine to reunite students with belongings.</p>
      </div>

      {message && <div className={`eb-alert eb-alert-${msgType==='error'?'error':msgType==='success'?'success':'info'} mb-4 animate-fade`}>{message}</div>}

      <div className="row g-4 mt-1">
        {/* Report Forms */}
        <div className="col-lg-4 animate-fade-up delay-1">
          <div className="eb-card p-4 mb-4">
            <h5 style={{fontWeight:700}} className="mb-3">❌ Report Lost Item</h5>
            <form onSubmit={submitLost}>
              <div className="mb-3">
                <label className="form-label">Item Name</label>
                <input className="form-control" placeholder="e.g. Blue Water Bottle" value={lostName} onChange={e=>setLostName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Brand, color, markings, where it was lost…" value={lostDesc} onChange={e=>setLostDesc(e.target.value)} required />
              </div>
              <button className="eb-btn-primary btn w-100">Submit Lost Report</button>
            </form>
          </div>

          <div className="eb-card p-4">
            <h5 style={{fontWeight:700}} className="mb-3">✅ Report Found Item</h5>
            <form onSubmit={submitFound}>
              <div className="mb-3">
                <label className="form-label">Item Name</label>
                <input className="form-control" placeholder="e.g. Red Pencil Box" value={foundName} onChange={e=>setFoundName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Where was it found?</label>
                <input className="form-control" placeholder="e.g. Playground, Library" value={foundLoc} onChange={e=>setFoundLoc(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Condition and current location of item…" value={foundDesc} onChange={e=>setFoundDesc(e.target.value)} required />
              </div>
              <button className="btn w-100" style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',fontWeight:600,borderRadius:10,padding:'0.65rem',border:'none'}}>Submit Found Report</button>
            </form>
          </div>
        </div>

        {/* Listings */}
        <div className="col-lg-8">
          {/* Match Suggestions for Staff */}
          {isStaff && lostItems.some(l=>l.status==='lost') && (() => {
            const matchPairs = lostItems.filter(l=>l.status==='lost').map(lost=>({lost, matches:getPotentialMatches(lost, foundItems)})).filter(p=>p.matches.length)
            if(!matchPairs.length) return null
            return (
              <div className="eb-match-card mb-4 animate-fade-up">
                <h5 style={{fontWeight:700,color:'#92400e'}} className="mb-2">🎯 Smart Match Suggestions</h5>
                <p className="text-muted small mb-3">System matched lost items with found items by keyword similarity.</p>
                {matchPairs.map(({lost, matches})=>(
                  <div key={lost._id} style={{background:'#fff',borderRadius:10,padding:'0.85rem',marginBottom:'0.5rem'}}>
                    <div className="small mb-1"><strong>Lost:</strong> {lost.itemName} — reported by {lost.reportedBy?.name||'User'}</div>
                    <div className="small mb-2" style={{color:'var(--brand-accent)',fontWeight:600}}>Possible matches:</div>
                    {matches.map(found=>(
                      <div key={found._id} className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small">✅ {found.itemName} in <strong>{found.locationFound||'unknown'}</strong></span>
                        <button className="btn btn-sm" style={{background:'var(--brand-accent)',color:'#fff',borderRadius:8,fontSize:'0.78rem',padding:'0.2rem 0.7rem'}}
                          onClick={()=>{ updateLostStatus(lost._id,'returned'); updateFoundStatus(found._id,'returned'); notify('✅ Both items marked as returned!','success') }}>
                          Mark Resolved
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Lost Items */}
          <div className="eb-card p-4 mb-4 animate-fade-up delay-2">
            <h5 style={{fontWeight:700}} className="mb-3">📋 Lost Items Noticeboard</h5>
            {loading ? <div className="eb-skeleton" style={{height:120,borderRadius:12}}/> :
            lostItems.length ? (
              <div className="d-flex flex-column gap-2" style={{maxHeight:400,overflowY:'auto'}}>
                {lostItems.map(item=>(
                  <div key={item._id} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:'1rem 1.1rem',background:'#fff'}}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{fontWeight:700}}>{item.itemName}</span>
                        <div className="text-muted small mt-1">
                          {new Date(item.date||item.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})} · {item.reportedBy?.name||'Staff'}
                        </div>
                        <p className="text-muted small mt-1 mb-0">{item.description}</p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className={`eb-badge ${lostStatusBadge(item.status)}`}>{item.status}</span>
                        {isStaff && (
                          <div className="d-flex gap-1">
                            <select className="form-select form-select-sm" style={{width:'auto',fontSize:'0.78rem'}}
                              value={item.status} onChange={e=>updateLostStatus(item._id, e.target.value)}>
                              <option value="lost">Lost</option>
                              <option value="claimed">Claimed</option>
                              <option value="returned">Returned</option>
                            </select>
                            {user.role==='admin' && (
                              <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{borderRadius:8,fontSize:'0.75rem'}}
                                onClick={()=>deleteLost(item._id)}>✕</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-center py-3">No lost items reported.</p>}
          </div>

          {/* Found Items */}
          <div className="eb-card p-4 animate-fade-up delay-3">
            <h5 style={{fontWeight:700}} className="mb-3">📦 Found Items Inventory</h5>
            {loading ? <div className="eb-skeleton" style={{height:120,borderRadius:12}}/> :
            foundItems.length ? (
              <div className="d-flex flex-column gap-2" style={{maxHeight:400,overflowY:'auto'}}>
                {foundItems.map(item=>(
                  <div key={item._id} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:'1rem 1.1rem',background:'#fff'}}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span style={{fontWeight:700}}>{item.itemName}</span>
                        <div className="text-muted small mt-1">
                          Found in <strong>{item.locationFound||'—'}</strong> · {new Date(item.date||item.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                        </div>
                        <p className="text-muted small mt-1 mb-0">{item.description}</p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className={`eb-badge ${foundStatusBadge(item.status)}`}>{item.status}</span>
                        {item.status==='found' && !isStaff && (
                          <button className="btn btn-sm" style={{background:'var(--brand-primary)',color:'#fff',borderRadius:8,fontSize:'0.8rem',padding:'0.25rem 0.75rem'}}
                            onClick={()=>claimItem(item._id)}>Claim</button>
                        )}
                        {isStaff && (
                          <div className="d-flex gap-1">
                            <select className="form-select form-select-sm" style={{width:'auto',fontSize:'0.78rem'}}
                              value={item.status} onChange={e=>updateFoundStatus(item._id, e.target.value)}>
                              <option value="found">Found</option>
                              <option value="claimed">Claimed</option>
                              <option value="returned">Returned</option>
                            </select>
                            {user.role==='admin' && (
                              <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{borderRadius:8,fontSize:'0.75rem'}}
                                onClick={()=>deleteFound(item._id)}>✕</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-center py-3">No found items registered.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
