import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api, { getUploadUrl } from '../services/api'
import { createMenu, listMeals, rateMeal, deleteRating } from '../services/mealService'
import {
  UtensilsCrossed, Star, MessageSquareWarning, Send,
  ClipboardList, ThumbsUp, Inbox
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
  if (user.role === 'teacher') {
    return <Navigate to="/dashboard" replace />
  }
  const [meals, setMeals]                     = useState([])
  const [date, setDate]                       = useState(new Date().toISOString().slice(0, 10))
  const [menuName, setMenuName]               = useState('')
  const [description, setDescription]         = useState('')
  const [selectedMealId, setSelectedMealId]   = useState('')
  const [score, setScore]                     = useState(5)
  const [comment, setComment]                 = useState('')
  const [ratingPhotos, setRatingPhotos]       = useState([])
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
      loadMeals()
    } else {
      loadMeals()
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

  const submitRating = async e => {
    e.preventDefault()
    if (!selectedMealId) { notify('Select a meal to rate.', 'error'); return }
    try {
      const formData = new FormData()
      formData.append('mealId', selectedMealId)
      formData.append('score', Number(score))
      formData.append('comment', comment)
      ratingPhotos.forEach(photo => formData.append('photos', photo))

      await rateMeal(formData)
      notify('Your rating has been saved!', 'success')
      setComment(''); setRatingPhotos([]); loadMeals()
    } catch (err) {
      notify('Unable to submit rating.', 'error')
      console.error(err)
    }
  }

  const deleteReview = async mealId => {
    try {
      await deleteRating(mealId)
      notify('Your review has been deleted.', 'success')
      loadMeals()
    } catch (err) {
      notify('Unable to delete review.', 'error')
      console.error(err)
    }
  }

  const isStaff = user.role === 'teacher'

  const weeklyReviewStats = meals.reduce((acc, meal) => {
    const reviews = meal.ratings || []
    return {
      reviewCount: acc.reviewCount + reviews.length,
      scoreTotal: acc.scoreTotal + reviews.reduce((sum, r) => sum + (r.score || 0), 0)
    }
  }, { reviewCount: 0, scoreTotal: 0 })

  const weeklyAverageRating = weeklyReviewStats.reviewCount
    ? Number((weeklyReviewStats.scoreTotal / weeklyReviewStats.reviewCount).toFixed(1))
    : 0

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
            : 'Review menus and rate daily quality.'}
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

          {meals.some(meal => meal.ratings?.some(r => (r.photos || []).length > 0)) && (
            <div className="mt-5">
              <div className="d-flex align-items-center gap-2 mb-4">
                <UtensilsCrossed size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>Meal Review Photos</h5>
              </div>
              <div className="row g-3">
                {meals.flatMap(meal => (
                  meal.ratings?.flatMap((rating, ridx) => (
                    (rating.photos || []).map((photo, pidx) => (
                      <div key={`${meal._id}-${ridx}-${pidx}`} className="col-6 col-md-3">
                        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={getUploadUrl(photo)} alt="Meal review" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                          <div style={{ padding: '0.75rem', background: 'var(--surface)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{meal.menuName || new Date(meal.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                            <div>{rating.comment || 'Review photo'}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ))
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Staff — Publish Menu & Count */}
          {isStaff && (
            <div className="row g-4 mb-4">
              <div className="col-lg-12 animate-fade-up delay-1">
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
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 600 }}>
                    Total reviews: {weeklyReviewStats.reviewCount}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    Average rating: {weeklyAverageRating} / 5
                  </div>
                </div>
                {meals.length ? (
                  <div className="d-flex flex-column gap-3">
                    {meals.map(meal => (
                      <div key={meal._id} style={{ background: 'var(--surface-1)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid var(--border)' }}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{meal.menuName || 'Meal Plan'}</span>
                          {meal.ratings?.length > 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span>{meal.ratings.length} review{meal.ratings.length !== 1 ? 's' : ''}</span>
                              <span>Avg {meal.averageRating || 0}/5</span>
                            </div>
                          )}
                        </div>
                        {meal.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.5rem', marginBottom: '0.3rem' }}>{meal.description}</p>}
                        {user.role === 'student' && meal.ratings?.length > 0 && (() => {
                          const ownReview = meal.ratings.find(r => r.user?._id === user._id || r.user === user._id)
                          return ownReview ? (
                            <div className="d-flex align-items-center justify-content-between gap-3 mt-3">
                              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                Your review: {ownReview.comment || `${ownReview.score}/5`}
                              </div>
                              <button type="button" className="eb-btn-outline btn btn-sm" onClick={() => deleteReview(meal._id)}>
                                Delete review
                              </button>
                            </div>
                          ) : null
                        })()}
                        {meal.ratings?.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mt-3">
                            {meal.ratings.flatMap(r => r.photos || []).slice(0, 4).map((photo, idx) => (
                              <img key={idx} src={getUploadUrl(photo)} alt={`meal-rating-${idx}`} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                            ))}
                          </div>
                        )}
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
                      <label className="form-label">Upload Meal Photos (optional)</label>
                      <input type="file" className="form-control" accept="image/*" multiple onChange={e => setRatingPhotos(Array.from(e.target.files).slice(0, 5))} />
                      <small className="form-text text-muted">Upload up to 5 images showing meal quality, hygiene, or serving size.</small>
                    </div>
                    {ratingPhotos.length > 0 && (
                      <div className="col-12">
                        <div className="d-flex flex-wrap gap-2">
                          {ratingPhotos.map((photo, idx) => (
                            <div key={idx} style={{ width: 80, height: 80, position: 'relative' }}>
                              <img src={URL.createObjectURL(photo)} alt="meal preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                              <button type="button" onClick={() => setRatingPhotos(prev => prev.filter((_, i) => i !== idx))}
                                style={{ position: 'absolute', top: 4, right: 4, border: 'none', background: 'rgba(0,0,0,.55)', color: 'white', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}>
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
