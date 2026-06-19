import React, { useEffect, useState } from 'react'
import { me } from '../services/authService'
import {
  User, Mail, Hash, Calendar, ShieldCheck, KeyRound,
  GraduationCap, Users, Wrench, Baby
} from 'lucide-react'

const roleConfig = {
  admin:       { icon: ShieldCheck,   bg: 'role-admin',       label: 'Administrator', color: '#5b21b6' },
  teacher:     { icon: Users,         bg: 'role-teacher',     label: 'Teacher',       color: '#be185d' },
  student:     { icon: GraduationCap, bg: 'role-student',     label: 'Student',       color: '#0369a1' },
  parent:      { icon: Users,         bg: 'role-parent',      label: 'Parent',        color: '#059669' },
  maintenance: { icon: Wrench,        bg: 'role-maintenance', label: 'Maintenance',   color: '#374151' },
}

function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 2 }}>
          {label}
        </div>
        {mono
          ? <code style={{ background: 'var(--surface-2)', padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.82rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{value}</code>
          : <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{value || '—'}</div>
        }
      </div>
    </div>
  )
}

export default function Profile() {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    me().then(r => setUser(r.data.user)).catch(() => {
      const cached = JSON.parse(localStorage.getItem('user') || 'null')
      if (cached) setUser(cached)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="eb-card p-5 text-center">
              <span className="eb-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Loading profile…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p style={{ color: 'var(--text-muted)' }}>Unable to load profile. Please try again.</p>
      </div>
    )
  }

  const rc = roleConfig[user.role] || { icon: User, bg: 'role-admin', label: 'User', color: '#64748b' }
  // For parent accounts, use parentName and parentPhone (frontend stores these on parent login)
  const isParent = user.role === 'parent'
  const displayName = isParent ? (user.parentName || user.name || user.studentName || user.student?.name || 'Parent') : (user.name || 'User')
  const displaySub = isParent ? user.parentPhone : user.email
  const initials = (!isParent ? (displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : null)
  const AvatarIcon = rc.icon
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="eb-page-header animate-fade-up" style={{ paddingBottom: '1.5rem' }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <User size={20} color="var(--brand-primary-light)" />
              <h2 style={{ margin: 0 }}>My Profile</h2>
            </div>
            <p>Your account information and portal access details.</p>
          </div>

          {/* Profile header card */}
          <div className="eb-card p-4 mb-4 animate-fade-up">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div className={`eb-avatar ${rc.bg}`}>
                {isParent
                  ? <AvatarIcon size={20} color="white" />
                  : initials
                }
              </div>
              <div className="flex-grow-1">
                <h4 style={{ fontWeight: 800, marginBottom: '0.2rem', letterSpacing: '-0.3px' }}>{displayName}</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{displaySub}</p>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${rc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <rc.icon size={14} color={rc.color} />
                  </div>
                  <span className={`eb-badge eb-badge-${user.role}`}>{rc.label}</span>
                </div>
              </div>
              {joinedDate && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Member Since
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{joinedDate}</div>
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="row g-4 animate-fade-up delay-2">
            <div className="col-md-6">
              <div className="eb-card p-4 h-100">
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Personal Information
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <DetailRow icon={User}  label="Full Name" value={isParent ? displayName : user.name} />
                  <DetailRow icon={Mail}  label={isParent ? "Mobile" : "Email"}     value={isParent ? displaySub : user.email} />
                  <DetailRow icon={rc.icon} label="Role"   value={rc.label} />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="eb-card p-4 h-100">
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Account Details
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  {(user.registrationNo || user.student?.registrationNo) && (
                    <DetailRow icon={Hash} label="Registration No" value={user.registrationNo || user.student?.registrationNo} mono />
                  )}
                  <DetailRow icon={Hash}     label="User ID"  value={user._id || user.id || '—'} mono />
                  {joinedDate && (
                    <DetailRow icon={Calendar} label="Joined" value={joinedDate} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password note */}
          <div className="eb-card p-4 mt-4 animate-fade-up delay-3"
            style={{ background: 'linear-gradient(135deg,#f0f4ff,#e8eeff)', border: '1px solid #c7d2fe' }}>
            <div className="d-flex gap-3 align-items-start">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <KeyRound size={18} color="#6366f1" />
              </div>
              <div>
                <h6 style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>Password Management</h6>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.65 }}>
                  Password changes are managed by the school administrator. If you need to reset your password, please contact the admin office.
                  Students can use their <strong>date of birth (DDMMYYYY)</strong> as the default password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
