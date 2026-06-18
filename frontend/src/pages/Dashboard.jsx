import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getAttendanceByStudent } from '../services/attendanceService'
import { listMeals } from '../services/mealService'
import {
  Users, GraduationCap, UserCheck, CalendarCheck, UtensilsCrossed,
  MessageSquareWarning, Wrench, Search, Bell, BarChart3, TrendingUp,
  CheckCircle2, XCircle, Clock, Baby, ShieldCheck, ArrowRight, Star
} from 'lucide-react'

const formatDate = date =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getYYYYMMDD = d => {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const statusBadge = s =>
  s === 'present' ? 'eb-badge-present' : s === 'absent' ? 'eb-badge-absent' : 'eb-badge-pending'

const roleInfo = {
  admin:       { color: 'eb-card-indigo',  label: 'Administrator' },
  teacher:     { color: 'eb-card-rose',    label: 'Teacher'       },
  student:     { color: 'eb-card-sky',     label: 'Student'       },
  parent:      { color: 'eb-card-emerald', label: 'Parent'        },
  maintenance: { color: 'eb-card-amber',   label: 'Maintenance'   },
}

function StatCard({ color, icon: Icon, iconColor, iconBg, value, label, delay }) {
  return (
    <div className={`col-6 col-md-3 animate-fade-up delay-${delay}`}>
      <div className={`eb-stat-card ${color}`}>
        <div className="eb-stat-icon" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, iconColor = 'var(--brand-primary-light)' }) {
  return (
    <Link to={to} className="text-decoration-none">
      <div className="d-flex align-items-center gap-3 p-3 rounded-3"
        style={{ border: '1.5px solid var(--border)', transition: 'all 0.18s', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary-light)'; e.currentTarget.style.background = '#f0f5ff'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={iconColor} />
        </div>
        {label}
        <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const role = user?.role || 'guest'
  const ri = roleInfo[role] || { color: 'eb-card-indigo', label: 'User' }

  const [summary, setSummary]                   = useState(null)
  const [loadingSummary, setLoadingSummary]     = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [meals, setMeals]                       = useState([])
  const [childId, setChildId]                   = useState('')
  const [childRecords, setChildRecords]         = useState([])
  const [loadingChild, setLoadingChild]         = useState(false)

  useEffect(() => {
    if (role === 'admin') {
      setLoadingSummary(true)
      api.get('/admin/summary').then(r => setSummary(r.data)).catch(() => {}).finally(() => setLoadingSummary(false))
    }
    if (role === 'student') {
      getAttendanceByStudent(user._id || user.id).then(r => setAttendanceRecords(r.data)).catch(() => {})
      listMeals().then(r => setMeals(r.data)).catch(() => {})
    }
  }, [role])

  const fetchChildAttendance = () => {
    if (!childId) return
    setLoadingChild(true)
    getAttendanceByStudent(childId)
      .then(r => setChildRecords(r.data))
      .catch(() => setChildRecords([]))
      .finally(() => setLoadingChild(false))
  }

  const attendanceStats = records => {
    const present = records.filter(r => r.status === 'present').length
    const absent  = records.filter(r => r.status === 'absent').length
    return { total: records.length, present, absent }
  }

  const todayStr   = getYYYYMMDD(new Date())
  const todaysMeal = meals.find(m => getYYYYMMDD(m.date) === todayStr)
  const sStats     = attendanceStats(attendanceRecords)
  const cStats     = attendanceStats(childRecords)
  const pct        = sStats.total ? Math.round((sStats.present / sStats.total) * 100) : 0

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="container py-5">
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-5 animate-fade-up">
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--brand-primary-light)', marginBottom: '0.25rem' }}>
            Dashboard
          </p>
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Here's what's happening at your school today.
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className={`eb-avatar role-${role}`} style={{ width: 44, height: 44, fontSize: '0.95rem', borderRadius: 10 }}>
            {initials}
          </div>
          <div className="d-none d-md-block">
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.name}</div>
            <span className={`eb-badge eb-badge-${role}`}>{ri.label}</span>
          </div>
        </div>
      </div>

      {/* ── ADMIN ── */}
      {role === 'admin' && (
        <>
          {loadingSummary ? (
            <div className="row g-3 mb-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="col-6 col-md-3">
                  <div className="eb-skeleton" style={{ height: 110, borderRadius: 16 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <StatCard color="eb-card-indigo"  icon={Users}            iconColor="#4338ca" iconBg="rgba(99,102,241,.12)"  value={summary?.totalUsers}     label="Total Users"       delay={1} />
                <StatCard color="eb-card-sky"     icon={GraduationCap}    iconColor="#0369a1" iconBg="rgba(14,165,233,.12)"  value={summary?.totalStudents}  label="Students"          delay={2} />
                <StatCard color="eb-card-purple"  icon={UserCheck}        iconColor="#7c3aed" iconBg="rgba(124,58,237,.12)"  value={summary?.totalTeachers}  label="Teachers"          delay={3} />
                <StatCard color="eb-card-emerald" icon={CalendarCheck}    iconColor="#059669" iconBg="rgba(16,185,129,.12)"  value={summary?.attendanceToday} label="Attendance Today" delay={4} />
              </div>
              <div className="row g-3 mb-5">
                <StatCard color="eb-card-amber"  icon={UtensilsCrossed}       iconColor="#d97706" iconBg="rgba(245,158,11,.12)"  value={summary?.mealsServed}    label="Meals Served"     delay={1} />
                <StatCard color="eb-card-rose"   icon={MessageSquareWarning}  iconColor="#e11d48" iconBg="rgba(244,63,94,.12)"   value={summary?.openComplaints} label="Open Complaints"  delay={2} />
                <StatCard color="eb-card-teal"   icon={Wrench}                iconColor="#0d9488" iconBg="rgba(13,148,136,.12)"  value={summary?.openIssues}     label="Open Issues"      delay={3} />
                <StatCard color="eb-card-sky"    icon={Search}                iconColor="#0369a1" iconBg="rgba(14,165,233,.12)"  value={summary?.lostCount}      label="Lost Items"       delay={4} />
              </div>
            </>
          )}

          <div className="mb-3">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Quick Access
            </h5>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="eb-card p-3">
                <h6 style={{ fontWeight: 700 }}>Recent Students</h6>
                <ul className="list-unstyled mb-0 mt-3">
                  {summary?.recentStudents?.length ? summary.recentStudents.map(s => (
                    <li key={s._id} className="py-2 border-bottom">
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.rollNo} • {s.className || '-'} • {new Date(s.createdAt).toLocaleDateString()}</div>
                    </li>
                  )) : <div className="text-muted">No recent students</div>}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="eb-card p-3">
                <h6 style={{ fontWeight: 700 }}>Students Per Class</h6>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {summary?.studentsPerClass?.length ? summary.studentsPerClass.map(c => (
                    <span key={c.className} className="eb-badge" style={{ padding: '0.4rem .6rem' }}>{c.className || 'Unassigned'}: {c.count}</span>
                  )) : <div className="text-muted">No data</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="row g-4">
            {[
              { icon: CalendarCheck,       title: 'Attendance',     desc: 'View & manage daily student attendance.',                  to: '/attendance',       color: 'eb-card-emerald', iconColor: '#059669', iconBg: 'rgba(16,185,129,.12)' },
              { icon: UtensilsCrossed,     title: 'Meal Monitoring',desc: 'Review student meal complaints and ratings.',              to: '/meals',            color: 'eb-card-amber',   iconColor: '#d97706', iconBg: 'rgba(245,158,11,.12)' },
              { icon: ShieldCheck,         title: 'Admin Modules',  desc: 'Manage classes, students, teachers and users.',            to: '/admin/students',   color: 'eb-card-indigo',  iconColor: '#4338ca', iconBg: 'rgba(99,102,241,.12)' },
              { icon: MessageSquareWarning,title: 'Complaints',     desc: 'Review, respond and resolve grievances.',                  to: '/complaints',       color: 'eb-card-rose',    iconColor: '#e11d48', iconBg: 'rgba(244,63,94,.12)' },
              { icon: Wrench,              title: 'Infrastructure', desc: 'Monitor and track facility repair tasks.',                 to: '/infrastructure',   color: 'eb-card-teal',    iconColor: '#0d9488', iconBg: 'rgba(13,148,136,.12)' },
              { icon: Search,              title: 'Lost & Found',   desc: 'Manage unclaimed items and reunite students.',             to: '/lostfound',        color: 'eb-card-purple',  iconColor: '#7c3aed', iconBg: 'rgba(124,58,237,.12)' },
            ].map((card, i) => (
              <div key={i} className={`col-md-4 animate-fade-up delay-${i + 1}`}>
                <div className="eb-feature-card d-flex flex-column" style={{ padding: '1.5rem' }}>
                  <div className="eb-feature-icon-wrap" style={{ background: card.iconBg, color: card.iconColor }}>
                    <card.icon size={20} />
                  </div>
                  <h5 style={{ fontWeight: 700 }}>{card.title}</h5>
                  <p style={{ fontSize: '0.85rem', flexGrow: 1 }}>{card.desc}</p>
                  <Link to={card.to} className="eb-btn-outline" style={{ fontSize: '0.83rem', alignSelf: 'flex-start', marginTop: '0.75rem' }}>
                    Open <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── TEACHER ── */}
      {role === 'teacher' && (
        <div className="row g-4">
          {[
            { icon: CalendarCheck,       title: 'Mark Attendance',  desc: 'Mark student attendance for your classes.',          to: '/attendance',     iconColor: '#4338ca', iconBg: 'rgba(99,102,241,.1)'  },
            { icon: Bell,               title: 'School Notices',    desc: 'Post announcements and academic schedules.',          to: '/notices',        iconColor: '#0369a1', iconBg: 'rgba(14,165,233,.1)'  },
            { icon: Search,              title: 'Lost & Found',     desc: 'Help students recover lost valuables.',               to: '/lostfound',      iconColor: '#7c3aed', iconBg: 'rgba(124,58,237,.1)'  },
          ].map((card, i) => (
            <div key={i} className={`col-md-4 animate-fade-up delay-${i + 1}`}>
              <div className="eb-feature-card d-flex flex-column" style={{ padding: '1.5rem' }}>
                <div className="eb-feature-icon-wrap" style={{ background: card.iconBg, color: card.iconColor }}>
                  <card.icon size={20} />
                </div>
                <h5 style={{ fontWeight: 700 }}>{card.title}</h5>
                <p style={{ fontSize: '0.85rem', flexGrow: 1 }}>{card.desc}</p>
                <Link to={card.to} className="eb-btn-outline" style={{ fontSize: '0.83rem', alignSelf: 'flex-start', marginTop: '0.75rem' }}>
                  Open <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STUDENT ── */}
      {role === 'student' && (
        <>
          <div className="row g-3 mb-4">
            <StatCard color="eb-card-emerald" icon={CheckCircle2} iconColor="#059669" iconBg="rgba(16,185,129,.12)" value={sStats.present} label="Days Present"  delay={1} />
            <StatCard color="eb-card-rose"    icon={XCircle}      iconColor="#e11d48" iconBg="rgba(244,63,94,.12)"  value={sStats.absent}  label="Days Absent"   delay={2} />
            <StatCard color="eb-card-sky"     icon={CalendarCheck}iconColor="#0369a1" iconBg="rgba(14,165,233,.12)" value={sStats.total}   label="Total Recorded" delay={3} />
            <StatCard color="eb-card-indigo"  icon={BarChart3}    iconColor="#4338ca" iconBg="rgba(99,102,241,.12)" value={`${pct}%`}      label="Attendance %"  delay={4} />
          </div>

          {/* Attendance progress */}
          {sStats.total > 0 && (
            <div className="eb-card p-4 mb-4 animate-fade-up">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <BarChart3 size={16} color="var(--brand-primary-light)" />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Overall Attendance</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>
                  {pct}%
                </span>
              </div>
              <div className="eb-progress-bar">
                <div className="eb-progress-fill" style={{
                  width: `${pct}%`,
                  background: pct >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)' : pct >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                }} />
              </div>
              <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>0%</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>75% threshold</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div className="row g-4 mb-4">
            {/* Today's meal */}
            <div className="col-md-6 animate-fade-up delay-2">
              <div className="eb-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <UtensilsCrossed size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>Today's Meal</h5>
                </div>
                {todaysMeal ? (
                  <>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{todaysMeal.menuName}</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {todaysMeal.description || 'No description available'}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{todaysMeal.averageRating || 0}/5</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({todaysMeal.ratings?.length || 0} reviews)</span>
                    </div>
                    <Link to="/meals" className="eb-btn-primary w-100" style={{ fontSize: '0.85rem', justifyContent: 'center' }}>
                      Rate Today's Meal <ArrowRight size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No meal planned for today yet.</p>
                    <Link to="/meals" className="eb-btn-outline" style={{ fontSize: '0.85rem' }}>
                      View All Menus <ArrowRight size={13} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="col-md-6 animate-fade-up delay-3">
              <div className="eb-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <TrendingUp size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>Quick Actions</h5>
                </div>
                <div className="d-grid gap-2">
                  <QuickLink to="/attendance" icon={CalendarCheck}       label="View Attendance"  iconColor="#4338ca" />
                  <QuickLink to="/complaints" icon={MessageSquareWarning} label="Raise a Complaint" iconColor="#e11d48" />
                  <QuickLink to="/notices"    icon={Bell}                label="View Notices"     iconColor="#0369a1" />
                  <QuickLink to="/lostfound"  icon={Search}              label="Lost & Found"     iconColor="#7c3aed" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent attendance */}
          {attendanceRecords.length > 0 && (
            <div className="eb-card p-4 animate-fade-up">
              <div className="d-flex align-items-center gap-2 mb-3">
                <CalendarCheck size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>Recent Attendance</h5>
              </div>
              <div className="table-responsive">
                <table className="eb-table table table-borderless mb-0">
                  <thead><tr><th>Date</th><th>Status</th><th>Marked By</th></tr></thead>
                  <tbody>
                    {attendanceRecords.slice(0, 6).map(record => (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 500 }}>{formatDate(record.date)}</td>
                        <td><span className={`eb-badge ${statusBadge(record.status)}`}>{record.status}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{record.markedBy ? 'Staff' : 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <Link to="/attendance" style={{ color: 'var(--brand-primary-light)', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View full attendance <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PARENT ── */}
      {role === 'parent' && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 animate-fade-up">
              <div className="eb-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Baby size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>Child Attendance Lookup</h5>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Enter your child's student ID to view their attendance record.
                </p>
                <div className="input-group">
                  <input
                    value={childId} onChange={e => setChildId(e.target.value)}
                    placeholder="Student ID"
                    className="form-control"
                  />
                  <button className="eb-btn-primary btn" onClick={fetchChildAttendance} disabled={loadingChild}>
                    {loadingChild ? <span className="eb-spinner" /> : 'Load'}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 animate-fade-up delay-2">
              <div className="eb-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Bell size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>School Notices</h5>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Stay updated with school announcements and exam schedules.
                </p>
                <Link to="/notices" className="eb-btn-primary" style={{ fontSize: '0.875rem' }}>
                  View Notices <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {childRecords.length > 0 && (
            <div className="eb-card p-4 animate-fade-up">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <CalendarCheck size={16} color="var(--brand-primary-light)" />
                  <h5 style={{ fontWeight: 700, margin: 0 }}>Child's Attendance</h5>
                </div>
                <div className="d-flex gap-2">
                  <span className="eb-badge eb-badge-present">Present: {cStats.present}</span>
                  <span className="eb-badge eb-badge-absent">Absent: {cStats.absent}</span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="eb-table table table-borderless mb-0">
                  <thead><tr><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {childRecords.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 500 }}>{formatDate(r.date)}</td>
                        <td><span className={`eb-badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MAINTENANCE ── */}
      {role === 'maintenance' && (
        <div className="row g-4">
          {[
            { icon: Wrench,  title: 'Assigned Issues',  desc: 'Check your repair tasks and update progress.',              to: '/infrastructure', iconColor: '#d97706', iconBg: 'rgba(245,158,11,.1)' },
            { icon: Search,  title: 'Lost & Found',     desc: 'Manage found items and help students recover valuables.',   to: '/lostfound',      iconColor: '#7c3aed', iconBg: 'rgba(124,58,237,.1)' },
            { icon: Bell,    title: 'School Notices',   desc: 'Stay aware of announcements and maintenance alerts.',       to: '/notices',        iconColor: '#0369a1', iconBg: 'rgba(14,165,233,.1)' },
          ].map((card, i) => (
            <div key={i} className={`col-md-4 animate-fade-up delay-${i + 1}`}>
              <div className="eb-feature-card d-flex flex-column" style={{ padding: '1.5rem' }}>
                <div className="eb-feature-icon-wrap" style={{ background: card.iconBg, color: card.iconColor }}>
                  <card.icon size={20} />
                </div>
                <h5 style={{ fontWeight: 700 }}>{card.title}</h5>
                <p style={{ fontSize: '0.85rem', flexGrow: 1 }}>{card.desc}</p>
                <Link to={card.to} className="eb-btn-outline" style={{ fontSize: '0.83rem', alignSelf: 'flex-start', marginTop: '0.75rem' }}>
                  Open <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
