import React, { useEffect, useState } from 'react'
import api, { getUploadUrl } from '../services/api'
import { Search, PackageX, PackageCheck, MapPin, Clock, Trash2, CheckCircle2, Zap } from 'lucide-react'

const lostStatusBadge  = s => s === 'lost'  ? 'eb-badge-absent'  : s === 'claimed' ? 'eb-badge-review' : 'eb-badge-present'
const foundStatusBadge = s => s === 'found' ? 'eb-badge-assigned' : s === 'claimed' ? 'eb-badge-review' : 'eb-badge-present'

const getPotentialMatches = (lostItem, foundItems) => {
  const term = lostItem.itemName.trim().toLowerCase()
  if (!term) return []
  return foundItems.filter(f =>
    f.status === 'found' &&
    (f.itemName.toLowerCase().includes(term) || term.includes(f.itemName.toLowerCase()))
  )
}

export default function LostFound() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [lostName, setLostName]   = useState('')
  const [lostDesc, setLostDesc]   = useState('')
  const [lostImage, setLostImage] = useState(null)
  const [foundName, setFoundName] = useState('')
  const [foundDesc, setFoundDesc] = useState('')
  const [foundLoc, setFoundLoc]   = useState('')
  const [foundImage, setFoundImage] = useState(null)
  const [lostItems, setLostItems]   = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [message, setMessage]     = useState('')
  const [msgType, setMsgType]     = useState('info')
  const [loading, setLoading]     = useState(true)

  const notify = (msg, type = 'info') => { setMessage(msg); setMsgType(type) }

  const loadData = async () => {
    setLoading(true)
    try {
      const [lRes, fRes] = await Promise.all([api.get('/lostfound/lost'), api.get('/lostfound/found')])
      setLostItems(lRes.data); setFoundItems(fRes.data)
    } catch { notify('Error loading lost & found records.', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadData() }, [])

  const submitLost = async e => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('itemName', lostName)
      formData.append('description', lostDesc)
      if (lostImage) formData.append('image', lostImage)
      await api.post('/lostfound/lost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setLostName(''); setLostDesc(''); setLostImage(null)
      notify('Lost item reported successfully.', 'success'); loadData()
    } catch { notify('Error reporting lost item.', 'error') }
  }

  const submitFound = async e => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('itemName', foundName)
      formData.append('description', foundDesc)
      formData.append('locationFound', foundLoc)
      if (foundImage) formData.append('image', foundImage)
      await api.post('/lostfound/found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFoundName(''); setFoundDesc(''); setFoundLoc(''); setFoundImage(null)
      notify('Found item reported successfully.', 'success'); loadData()
    } catch { notify('Error reporting found item.', 'error') }
  }

  const claimItem = async id => {
    try { await api.post(`/lostfound/found/${id}/claim`); notify('Item claimed! Contact school administrator to retrieve it.', 'success'); loadData() }
    catch { notify('Error claiming item.', 'error') }
  }

  const updateLostStatus  = async (id, status) => {
    try { await api.put(`/lostfound/lost/${id}/status`, { status }); loadData() }
    catch { notify('Error updating status.', 'error') }
  }
  const updateFoundStatus = async (id, status) => {
    try { await api.put(`/lostfound/found/${id}/status`, { status }); loadData() }
    catch { notify('Error updating status.', 'error') }
  }
  const deleteLost  = async id => {
    try { await api.delete(`/lostfound/lost/${id}`); notify('Deleted.', 'info'); loadData() }
    catch { notify('Error deleting.', 'error') }
  }
  const deleteFound = async id => {
    try { await api.delete(`/lostfound/found/${id}`); notify('Deleted.', 'info'); loadData() }
    catch { notify('Error deleting.', 'error') }
  }

  const isStaff = user.role === 'admin' || user.role === 'maintenance' || user.role === 'teacher'

  // Smart matches for staff
  const matchPairs = isStaff
    ? lostItems
        .filter(l => l.status === 'lost')
        .map(lost => ({ lost, matches: getPotentialMatches(lost, foundItems) }))
        .filter(p => p.matches.length)
    : []

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="eb-page-header animate-fade-up">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Search size={20} color="var(--brand-primary-light)" />
          <h2 style={{ margin: 0 }}>Lost &amp; Found Management</h2>
        </div>
        <p>Register misplaced items, report found items, and use the smart matching engine to reunite students with belongings.</p>
      </div>

      {message && (
        <div className={`eb-alert eb-alert-${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : 'info'} mb-4 animate-fade`}>
          {message}
        </div>
      )}

      <div className="row g-4 mt-1">
        {/* Report Forms column */}
        <div className="col-12 col-lg-4 animate-fade-up delay-1">
          {/* Lost */}
          <div className="eb-card p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PackageX size={16} color="#dc2626" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Report Lost Item</h5>
            </div>
            <form onSubmit={submitLost}>
              <div className="mb-3">
                <label className="form-label">Item Name</label>
                <input className="form-control" placeholder="e.g. Blue Water Bottle"
                  value={lostName} onChange={e => setLostName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3}
                  placeholder="Brand, color, markings, where it was lost…"
                  value={lostDesc} onChange={e => setLostDesc(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Upload Photo (optional)</label>
                <input type="file" className="form-control" accept="image/*"
                  onChange={e => setLostImage(e.target.files[0] || null)} />
                {lostImage && (
                  <div className="mt-3" style={{ width: 96, height: 96, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <img src={URL.createObjectURL(lostImage)} alt="lost preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <button className="eb-btn-primary btn w-100" style={{ justifyContent: 'center' }}>
                <PackageX size={14} />Submit Lost Report
              </button>
            </form>
          </div>

          {/* Found */}
          <div className="eb-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PackageCheck size={16} color="#059669" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Report Found Item</h5>
            </div>
            <form onSubmit={submitFound}>
              <div className="mb-3">
                <label className="form-label">Item Name</label>
                <input className="form-control" placeholder="e.g. Red Pencil Box"
                  value={foundName} onChange={e => setFoundName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Where was it found?</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-control" placeholder="e.g. Playground, Library"
                    value={foundLoc} onChange={e => setFoundLoc(e.target.value)}
                    required style={{ paddingLeft: '2.25rem' }} />
                  <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Upload Photo (optional)</label>
                <input type="file" className="form-control" accept="image/*"
                  onChange={e => setFoundImage(e.target.files[0] || null)} />
                {foundImage && (
                  <div className="mt-3" style={{ width: 96, height: 96, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <img src={URL.createObjectURL(foundImage)} alt="found preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3}
                  placeholder="Condition and current location of item…"
                  value={foundDesc} onChange={e => setFoundDesc(e.target.value)} required />
              </div>
              <button className="btn w-100" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 600, borderRadius: 8, padding: '0.6rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <PackageCheck size={14} />Submit Found Report
              </button>
            </form>
          </div>
        </div>

        {/* Listings column */}
        <div className="col-lg-8">
          {/* Smart Match Panel */}
          {matchPairs.length > 0 && (
            <div className="eb-match-card mb-4 animate-fade-up">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Zap size={16} color="#92400e" />
                <h5 style={{ fontWeight: 700, color: '#92400e', margin: 0 }}>Smart Match Suggestions</h5>
              </div>
              <p style={{ color: '#b45309', fontSize: '0.84rem', marginBottom: '1rem' }}>
                System matched lost items with found items by keyword similarity.
              </p>
              {matchPairs.map(({ lost, matches }) => (
                <div key={lost._id} style={{ background: 'var(--surface)', borderRadius: 10, padding: '0.85rem', marginBottom: '0.5rem', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <strong>Lost:</strong> {lost.itemName} — reported by {lost.reportedBy?.name || 'User'}
                  </div>
                  <div style={{ color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.4rem' }}>Possible matches:</div>
                  {matches.map(found => (
                    <div key={found._id} className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontSize: '0.84rem' }}>
                        <CheckCircle2 size={12} color="var(--brand-accent)" style={{ marginRight: 4 }} />
                        {found.itemName} in <strong>{found.locationFound || 'unknown'}</strong>
                      </span>
                      <button className="btn btn-sm"
                        style={{ background: 'var(--brand-accent)', color: '#fff', borderRadius: 7, fontSize: '0.78rem', padding: '0.2rem 0.7rem' }}
                        onClick={() => {
                          updateLostStatus(lost._id, 'returned')
                          updateFoundStatus(found._id, 'returned')
                          notify('Both items marked as returned!', 'success')
                        }}>
                        Mark Resolved
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Lost Items */}
          <div className="eb-card p-4 mb-4 animate-fade-up delay-2">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PackageX size={16} color="#dc2626" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Lost Items Noticeboard</h5>
              {lostItems.length > 0 && <span className="eb-badge eb-badge-absent ms-auto">{lostItems.length} items</span>}
            </div>
            {loading
              ? <div className="eb-skeleton" style={{ height: 120, borderRadius: 12 }} />
              : lostItems.length ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {lostItems.map(item => (
                    <div key={item._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.1rem', background: 'var(--surface)' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flexGrow: 1 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.itemName}</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={11} />
                            {new Date(item.date || item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            · {item.reportedBy?.name || 'Staff'}
                          </div>
                          {item.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 4, marginBottom: 0 }}>{item.description}</p>}
                          {item.image && (
                            <div className="mt-3" style={{ width: 100, height: 100, overflow: 'hidden', borderRadius: 14, border: '1px solid var(--border)' }}>
                              <img src={getUploadUrl(item.image)} alt="lost item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2 ms-2" style={{ flexShrink: 0 }}>
                          <span className={`eb-badge ${lostStatusBadge(item.status)}`}>{item.status}</span>
                          {isStaff && (
                            <div className="d-flex gap-1">
                              <select className="form-select form-select-sm" style={{ width: 'auto', fontSize: '0.78rem' }}
                                value={item.status} onChange={e => updateLostStatus(item._id, e.target.value)}>
                                <option value="lost">Lost</option>
                                <option value="claimed">Claimed</option>
                                <option value="returned">Returned</option>
                              </select>
                              {user.role === 'admin' && (
                                <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ borderRadius: 7, fontSize: '0.75rem' }}
                                  onClick={() => deleteLost(item._id)}>
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No lost items reported.</p>
            }
          </div>

          {/* Found Items */}
          <div className="eb-card p-4 animate-fade-up delay-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PackageCheck size={16} color="#059669" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Found Items Inventory</h5>
              {foundItems.length > 0 && <span className="eb-badge eb-badge-assigned ms-auto">{foundItems.length} items</span>}
            </div>
            {loading
              ? <div className="eb-skeleton" style={{ height: 120, borderRadius: 12 }} />
              : foundItems.length ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {foundItems.map(item => (
                    <div key={item._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.1rem', background: 'var(--surface)' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flexGrow: 1 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.itemName}</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={11} />
                            Found in <strong style={{ color: 'var(--text-secondary)' }}>{item.locationFound || '—'}</strong>
                            · {new Date(item.date || item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                          {item.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 4, marginBottom: 0 }}>{item.description}</p>}
                          {item.image && (
                            <div className="mt-3" style={{ width: 100, height: 100, overflow: 'hidden', borderRadius: 14, border: '1px solid var(--border)' }}>
                              <img src={getUploadUrl(item.image)} alt="found item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2 ms-2" style={{ flexShrink: 0 }}>
                          <span className={`eb-badge ${foundStatusBadge(item.status)}`}>{item.status}</span>
                          {item.status === 'found' && !isStaff && (
                            <button className="btn btn-sm"
                              style={{ background: 'var(--brand-primary)', color: '#fff', borderRadius: 7, fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                              onClick={() => claimItem(item._id)}>
                              Claim
                            </button>
                          )}
                          {isStaff && (
                            <div className="d-flex gap-1">
                              <select className="form-select form-select-sm" style={{ width: 'auto', fontSize: '0.78rem' }}
                                value={item.status} onChange={e => updateFoundStatus(item._id, e.target.value)}>
                                <option value="found">Found</option>
                                <option value="claimed">Claimed</option>
                                <option value="returned">Returned</option>
                              </select>
                              {user.role === 'admin' && (
                                <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ borderRadius: 7, fontSize: '0.75rem' }}
                                  onClick={() => deleteFound(item._id)}>
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No found items registered.</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
