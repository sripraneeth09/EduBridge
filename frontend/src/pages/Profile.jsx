import React, { useEffect, useState } from 'react'
import { me } from '../services/authService'

const roleConfig = {
  admin:       { icon:'🔑', bg:'role-admin',       label:'Administrator', color:'var(--brand-primary)' },
  teacher:     { icon:'👩‍🏫', bg:'role-teacher',     label:'Teacher',       color:'#be185d' },
  student:     { icon:'🧑‍🎓', bg:'role-student',     label:'Student',       color:'#0284c7' },
  parent:      { icon:'👨‍👩‍👧', bg:'role-parent',      label:'Parent',        color:'#059669' },
  maintenance: { icon:'🔧', bg:'role-maintenance', label:'Maintenance',   color:'#374151' },
}

export default function Profile(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    me().then(r => setUser(r.data.user)).catch(() => {
      // fallback to localStorage
      const cached = JSON.parse(localStorage.getItem('user') || 'null')
      if(cached) setUser(cached)
    }).finally(() => setLoading(false))
  }, [])

  if(loading){
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="eb-card p-5 text-center">
              <span className="eb-spinner" style={{width:32,height:32,borderWidth:4}}></span>
              <p className="text-muted mt-3">Loading profile…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!user){
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Unable to load profile. Please try again.</p>
      </div>
    )
  }

  const rc = roleConfig[user.role] || { icon:'👤', bg:'role-admin', label:'User', color:'#64748b' }
  const initials = (user.name || 'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : null

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 style={{fontWeight:800,letterSpacing:'-0.5px'}} className="mb-4 animate-fade-up">My Profile</h2>

          {/* Profile card */}
          <div className="eb-card p-4 mb-4 animate-fade-up">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div className={`eb-avatar ${rc.bg}`}>{initials}</div>
              <div className="flex-grow-1">
                <h4 style={{fontWeight:800,marginBottom:'0.25rem'}}>{user.name}</h4>
                <p className="text-muted mb-2" style={{fontSize:'0.9rem'}}>{user.email}</p>
                <span className={`eb-badge eb-badge-${user.role}`} style={{fontSize:'0.78rem',padding:'0.3rem 0.75rem'}}>
                  {rc.icon} {rc.label}
                </span>
              </div>
              {joinedDate && (
                <div className="text-end" style={{fontSize:'0.8rem',color:'#94a3b8'}}>
                  <div>Member since</div>
                  <div style={{fontWeight:600,color:'#64748b'}}>{joinedDate}</div>
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="row g-3 animate-fade-up delay-2">
            {/* Personal info */}
            <div className="col-md-6">
              <div className="eb-card p-4 h-100">
                <h6 style={{fontWeight:700,textTransform:'uppercase',fontSize:'0.75rem',letterSpacing:'1px',color:'#94a3b8'}} className="mb-3">Personal Info</h6>
                <dl className="row mb-0" style={{fontSize:'0.9rem'}}>
                  <dt className="col-5 text-muted fw-normal">Full Name</dt>
                  <dd className="col-7 fw-600 mb-2" style={{fontWeight:600}}>{user.name || '—'}</dd>

                  <dt className="col-5 text-muted fw-normal">Email</dt>
                  <dd className="col-7 mb-2" style={{wordBreak:'break-all'}}>{user.email || '—'}</dd>

                  <dt className="col-5 text-muted fw-normal">Role</dt>
                  <dd className="col-7 mb-2 text-capitalize">{rc.label}</dd>
                </dl>
              </div>
            </div>

            {/* Account info */}
            <div className="col-md-6">
              <div className="eb-card p-4 h-100">
                <h6 style={{fontWeight:700,textTransform:'uppercase',fontSize:'0.75rem',letterSpacing:'1px',color:'#94a3b8'}} className="mb-3">Account Details</h6>
                <dl className="row mb-0" style={{fontSize:'0.9rem'}}>
                  {user.registrationNo && (
                    <>
                      <dt className="col-5 text-muted fw-normal">Registration No</dt>
                      <dd className="col-7 mb-2"><code style={{background:'#f1f5f9',padding:'0.15rem 0.5rem',borderRadius:6,fontSize:'0.85rem'}}>{user.registrationNo}</code></dd>
                    </>
                  )}
                  <dt className="col-5 text-muted fw-normal">User ID</dt>
                  <dd className="col-7 mb-2"><code style={{background:'#f1f5f9',padding:'0.15rem 0.5rem',borderRadius:6,fontSize:'0.75rem'}}>{user._id || user.id || '—'}</code></dd>

                  {joinedDate && (
                    <>
                      <dt className="col-5 text-muted fw-normal">Joined</dt>
                      <dd className="col-7 mb-0">{joinedDate}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Password note */}
          <div className="eb-card p-4 mt-3 animate-fade-up delay-3" style={{background:'#f0f4ff',border:'none'}}>
            <div className="d-flex gap-3 align-items-start">
              <span style={{fontSize:'1.5rem'}}>🔐</span>
              <div>
                <h6 style={{fontWeight:700,marginBottom:'0.25rem'}}>Password Management</h6>
                <p className="text-muted small mb-0">
                  Password changes are managed by the school administrator. If you need to reset your password, please contact the admin office. Students can use their <strong>date of birth (DDMMYYYY)</strong> as the default password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
