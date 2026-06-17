import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { createMenu, updateCount, listMeals, rateMeal, listStock, createStock, deleteStock, updateStock } from '../services/mealService'
import {
  UtensilsCrossed, Star, MessageSquareWarning, Send, CheckCircle2,
  Clock, RotateCcw, ClipboardList, ThumbsUp, Inbox
} from 'lucide-react'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="eb-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          className={`eb-star ${n <= (hovered || value) ? 'active' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >★</span>
      ))}
    </div>
  )
}

const stockLevel = qty => qty < 10 ? 'eb-stock-low' : qty < 50 ? 'eb-stock-medium' : 'eb-stock-ok'

const statusSteps = ['pending', 'under review', 'in progress', 'resolved']

const statusBadge = s =>
  s === 'resolved'     ? 'eb-badge-present' :
  s === 'in progress'  ? 'eb-badge-progress' :
  s === 'under review' ? 'eb-badge-review'   : 'eb-badge-pending'

function StatusTimeline({ status }) {
  const cur = statusSteps.indexOf(status)
  return (
    <div className="eb-timeline my-2">
      {statusSteps.map((step, i) => (
        <div key={step} className={`eb-timeline-step ${i < cur ? 'done' : i === cur ? 'current' : ''}`}>
          {step}
        </div>
      ))}
    </div>
  )
}

export default function MealMonitoring() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [meals, setMeals]                     = useState([])
  const [date, setDate]                       = useState(new Date().toISOString().slice(0, 10))
  const [menuName, setMenuName]               = useState('')
  const [description, setDescription]         = useState('')
  const [countDate, setCountDate]             = useState(new Date().toISOString().slice(0, 10))
  const [numberServed, setNumberServed]       = useState(0)
  const [selectedMealId, setSelectedMealId]   = useState('')
  const [score, setScore]                     = useState(5)
  const [comment, setComment]                 = useState('')
  const [stocks, setStocks]                   = useState([])
  const [newItemName, setNewItemName]         = useState('')
  const [newQuantity, setNewQuantity]         = useState(0)
  const [newUnit, setNewUnit]                 = useState('kg')
  const [message, setMessage]                 = useState('')
  const [msgType, setMsgType]                 = useState('info')
  const [complaints, setComplaints]           = useState([])
  const [commentsMap, setCommentsMap]         = useState({})
  const [loadingComplaints, setLoadingComplaints] = useState(false)

  const notify = (msg, type = 'info') => { setMessage(msg); setMsgType(type) }

  const loadMeals = () => {
    listMeals().then(r => {
      setMeals(r.data)
      if (r.data[0] && !selectedMealId) setSelectedMealId(r.data[0]._id)
    }).catch(() => {})
  }

  const loadStock = () => {
    if (user.role === 'teacher' || user.role === 'admin')
      listStock().then(r => setStocks(r.data)).catch(() => {})
  }

  const loadComplaints = async () => {
    if (user.role !== 'admin') return
    setLoadingComplaints(true)
    try {
      const res = await api.get('/complaints')
      setComplaints(res.data.filter(c => c.category === 'meal'))
    } catch { notify('Error loading meal complaints.', 'error') }
    finally { setLoadingComplaints(false) }
  }

  const updateComplaintStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status })
      notify('Complaint status updated.', 'success')
      loadComplaints()
    } catch { notify('Error updating complaint status.', 'error') }
  }

  const handleCommentChange = (id, text) => setCommentsMap(prev => ({ ...prev, [id]: text }))

  const submitComment = async (e, id) => {
    e.preventDefault()
    const text = commentsMap[id]
    if (!text?.trim()) return
    try {
      await api.post(`/complaints/${id}/comment`, { text })
      setCommentsMap(prev => ({ ...prev, [id]: '' }))
      notify('Comment posted successfully.', 'success')
      loadComplaints()
    } catch { notify('Error posting comment.', 'error') }
  }

  useEffect(() => {
    if (user.role === 'admin') {
      loadComplaints()
    } else {
      loadMeals()
      loadStock()
    }
  }, [])

  const submitMenu = async e => {
    e.preventDefault()
    try {
      await createMenu({ date, menuName, description })
      notify('Meal menu published successfully.', 'success')
      setMenuName(''); setDescription(''); loadMeals()
    } catch { notify('Unable to create menu.', 'error') }
  }

  const submitCount = async e => {
    e.preventDefault()
    try {
      await updateCount({ date: countDate, numberServed: Number(numberServed) })
      notify('Served count updated.', 'success')
      setNumberServed(0); loadMeals()
    } catch { notify('Unable to update count.', 'error') }
  }

  const submitRating = async e => {
    e.preventDefault()
    if (!selectedMealId) { notify('Select a meal to rate.', 'error'); return }
    try {
      await rateMeal({ mealId: selectedMealId, score: Number(score), comment })
      notify('Your rating has been saved!', 'success')
      setComment(''); loadMeals()
    } catch { notify('Unable to submit rating.', 'error') }
  }

  const submitStock = async e => {
    e.preventDefault()
    try {
      await createStock({ itemName: newItemName, quantity: Number(newQuantity), unit: newUnit })
      notify('Stock item added.', 'success')
      setNewItemName(''); setNewQuantity(0); loadStock()
    } catch { notify('Unable to add stock item.', 'error') }
  }

  const handleAdjustStock = async (id, delta) => {
    const item = stocks.find(s => s._id === id); if (!item) return
    try { await updateStock(id, { quantity: Math.max(0, item.quantity + delta) }); loadStock() }
    catch { notify('Unable to update stock.', 'error') }
  }

  const handleRemoveStock = async id => {
    try { await deleteStock(id); notify('Stock item deleted.', 'info'); loadStock() }
    catch { notify('Unable to delete stock item.', 'error') }
  }

  const isStaff = user.role === 'teacher'

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="eb-page-header animate-fade-up">
        <div className="d-flex align-items-center gap-2 mb-1">
          <UtensilsCrossed size={20} color="var(--brand-primary-light)" />
          <h2 style={{ margin: 0 }}>Mid-Day Meal Monitoring</h2>
        </div>
        <p>
          {user.role === 'admin'
            ? 'Review and manage student complaints regarding the mid-day meal service.'
            : 'Review menus, rate daily quality, and manage ingredients inventory stock.'}
        </p>
      </div>

      {message && (
        <div className={`eb-alert eb-alert-${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : 'info'} mb-4 animate-fade`}>
          {message}
        </div>
      )}

      {/* ── ADMIN VIEW: Complaints only ── */}
      {user.role === 'admin' ? (
        <div className="eb-card p-4 animate-fade-up">
          <div className="d-flex align-items-center gap-2 mb-4">
            <MessageSquareWarning size={16} color="var(--brand-primary-light)" />
            <h5 style={{ fontWeight: 700, margin: 0 }}>Meal Grievances Board</h5>
            {complaints.length > 0 && (
              <span className="eb-badge eb-badge-pending ms-auto">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loadingComplaints ? (
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map(i => <div key={i} className="eb-skeleton" style={{ height: 100, borderRadius: 12 }} />)}
            </div>
          ) : complaints.length ? (
            <div className="d-flex flex-column gap-3">
              {complaints.map(comp => (
                <div key={comp._id} className="animate-fade" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', background: 'var(--surface)' }}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontWeight: 700, fontSize: '0.97rem' }}>{comp.title}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {new Date(comp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · by '}
                        {comp.anonymous
                          ? <span style={{ color: 'var(--brand-warning)', fontWeight: 600 }}>Anonymous</span>
                          : <span style={{ fontWeight: 600 }}>{comp.createdBy?.name || 'User'}</span>}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>
                        {comp.description}
                      </p>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2" style={{ flexShrink: 0 }}>
                      <span className={`eb-badge ${statusBadge(comp.status)}`}>{comp.status}</span>
                      <select className="form-select form-select-sm"
                        style={{ width: 'auto', minWidth: 140, fontSize: '0.8rem' }}
                        value={comp.status}
                        onChange={e => updateComplaintStatus(comp._id, e.target.value)}>
                        {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <StatusTimeline status={comp.status} />

                  {/* Comments */}
                  <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '0.9rem', marginTop: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    ) : <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No updates posted yet.</p>}
                    <form onSubmit={e => submitComment(e, comp._id)} className="d-flex gap-2">
                      <input className="form-control form-control-sm" placeholder="Post a progress update…"
                        value={commentsMap[comp._id] || ''} onChange={e => handleCommentChange(comp._id, e.target.value)} required />
                      <button className="eb-btn-primary btn btn-sm px-3" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Send size={12} />Post
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
              <Inbox size={40} color="#e2e8f0" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No meal complaints recorded yet.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Staff — Publish Menu & Count */}
          {isStaff && (
            <div className="row g-4 mb-4">
              <div className="col-lg-7 animate-fade-up delay-1">
                <div className="eb-card p-4 h-100">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <ClipboardList size={16} color="var(--brand-primary-light)" />
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Publish Daily Menu</h5>
                  </div>
                  <form onSubmit={submitMenu} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Menu Name</label>
                      <input className="form-control" placeholder="e.g. Tamarind Rice & Egg" value={menuName} onChange={e => setMenuName(e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Ingredients / Description</label>
                      <input className="form-control" placeholder="e.g. Cooked rice, tamarind pulp, boiled egg" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <button className="eb-btn-primary btn">Publish Menu</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-lg-5 animate-fade-up delay-2">
                <div className="eb-card p-4 h-100">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CheckCircle2 size={16} color="var(--brand-primary-light)" />
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Update Served Count</h5>
                  </div>
                  <form onSubmit={submitCount} className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={countDate} onChange={e => setCountDate(e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Total Students Served</label>
                      <input type="number" className="form-control" placeholder="0" value={numberServed} onChange={e => setNumberServed(e.target.value)} required min="0" />
                    </div>
                    <div className="col-12">
                      <button className="eb-btn-primary btn w-100">Update Count</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Staff — Stock */}
          {isStaff && (
            <div className="eb-card p-4 mb-4 animate-fade-up">
              <div className="d-flex align-items-center gap-2 mb-3">
                <RotateCcw size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>Food Stock & Ingredients Inventory</h5>
              </div>
              <div className="row g-4">
                <div className="col-lg-4">
                  <div style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--border)' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Add Stock Item</h6>
                    <form onSubmit={submitStock} className="row g-2">
                      <div className="col-12">
                        <input className="form-control form-control-sm" placeholder="Ingredient (e.g. Rice)" value={newItemName} onChange={e => setNewItemName(e.target.value)} required />
                      </div>
                      <div className="col-7">
                        <input type="number" className="form-control form-control-sm" placeholder="Qty" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required min="0" />
                      </div>
                      <div className="col-5">
                        <select className="form-select form-select-sm" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                          <option value="kg">kg</option>
                          <option value="liters">liters</option>
                          <option value="bags">bags</option>
                          <option value="units">units</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <button className="eb-btn-primary btn btn-sm w-100">+ Add Stock</button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="col-lg-8">
                  {stocks.length ? (
                    <div className="table-responsive">
                      <table className="eb-table table table-borderless mb-0">
                        <thead><tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Adjust</th><th></th></tr></thead>
                        <tbody>
                          {stocks.map(item => (
                            <tr key={item._id}>
                              <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                              <td><span className={stockLevel(item.quantity)}>{item.quantity}</span></td>
                              <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  {[10, 1, -1, -10].map(d => (
                                    <button key={d} className="btn btn-sm py-0 px-2"
                                      style={{ fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: 6, lineHeight: 1.8 }}
                                      onClick={() => handleAdjustStock(item._id, d)}
                                      disabled={d < 0 && item.quantity + d < 0}>
                                      {d > 0 ? `+${d}` : d}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ borderRadius: 6, fontSize: '0.78rem' }}
                                  onClick={() => handleRemoveStock(item._id)}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.875rem' }}>No stock items added yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Meal Menu & Ratings */}
          <div className="row g-4">
            <div className={user.role === 'student' ? 'col-lg-7 animate-fade-up' : 'col-12 animate-fade-up'}>
              <div className="eb-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <UtensilsCrossed size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>Weekly Meal Menu</h5>
                </div>
                {meals.length ? (
                  <div className="d-flex flex-column gap-3">
                    {meals.map(meal => (
                      <div key={meal._id} style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid var(--border)' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{meal.menuName || 'Meal Plan'}</span>
                            <span className="ms-2 eb-badge eb-badge-progress" style={{ fontSize: '0.7rem' }}>
                              {new Date(meal.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Star size={13} color="#f59e0b" fill="#f59e0b" />
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{meal.averageRating || 0}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({meal.ratings?.length || 0})</span>
                          </div>
                        </div>
                        {meal.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.5rem', marginBottom: '0.3rem' }}>{meal.description}</p>}
                        <small style={{ color: 'var(--text-muted)' }}>Served: <strong>{meal.numberServed || 0}</strong> students</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No meal plans published yet.</p>
                )}
              </div>
            </div>

            {/* Rating form — students only */}
            {user.role === 'student' && (
              <div className="col-lg-5 animate-fade-up delay-2">
                <div className="eb-card p-4 h-100">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <ThumbsUp size={16} color="var(--brand-primary-light)" />
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Rate Today's Meal</h5>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
                    Help the administration improve meal quality by sharing your feedback.
                  </p>
                  <form onSubmit={submitRating} className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Select Meal</label>
                      <select className="form-select" value={selectedMealId} onChange={e => setSelectedMealId(e.target.value)}>
                        {meals.map(meal => (
                          <option key={meal._id} value={meal._id}>
                            {meal.menuName || new Date(meal.date).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Your Rating</label>
                      <div className="mt-1">
                        <StarRating value={score} onChange={setScore} />
                        <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]} ({score}/5)
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Comments (optional)</label>
                      <textarea className="form-control" rows="3" value={comment} onChange={e => setComment(e.target.value)} placeholder="Taste, quantity, freshness…" />
                    </div>
                    <div className="col-12">
                      <button className="eb-btn-primary btn w-100" style={{ justifyContent: 'center' }}>
                        Submit Feedback
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
