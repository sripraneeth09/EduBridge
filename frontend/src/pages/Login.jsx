import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import {
  GraduationCap, CalendarCheck, UtensilsCrossed, Bell, MessageSquareWarning,
  Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck
} from 'lucide-react'

const highlights = [
  { icon: CalendarCheck,        text: 'Track attendance in real time' },
  { icon: UtensilsCrossed,      text: 'View daily meal schedules'    },
  { icon: Bell,                 text: 'Read school notices instantly' },
  { icon: MessageSquareWarning, text: 'File and track complaints'     },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [err, setErr]           = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await login({ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.mustChangePassword) {
        navigate('/change-password')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setErr(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="eb-card overflow-hidden animate-scale">
            <div className="row g-0">
              {/* Left panel */}
              <div className="col-md-5 eb-auth-panel d-none d-md-flex">
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 52, height: 52, background: 'rgba(255,255,255,.12)',
                    borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,.15)',
                  }}>
                    <GraduationCap size={26} color="#fff" />
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Welcome back!</h3>
                  <p style={{ marginBottom: '2rem' }}>
                    Login to access your school dashboard and manage notices, attendance, meals and reports.
                  </p>
                  <div className="d-flex flex-column gap-3">
                    {highlights.map((item, i) => (
                      <div key={i} className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: 'rgba(255,255,255,.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <item.icon size={14} color="rgba(255,255,255,.9)" />
                        </div>
                        <span style={{ fontSize: '0.855rem', color: 'rgba(255,255,255,.75)', fontWeight: 400 }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '2.5rem', paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,.1)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ShieldCheck size={14} color="rgba(255,255,255,.45)" />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.4)' }}>
                      Secure, role-based access
                    </span>
                  </div>
                </div>
              </div>

              {/* Right form */}
              <div className="col-md-7 p-4 p-lg-5" style={{ background: 'var(--surface)' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '0.35rem' }}>
                    Sign in to your account
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                    Enter your credentials to access the portal.
                  </p>
                </div>

                {err && (
                  <div className="eb-alert eb-alert-error mb-4">
                    <MessageSquareWarning size={15} style={{ flexShrink: 0 }} />
                    {err}
                  </div>
                )}

                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="login-email">
                      Email or Registration Number
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      className="form-control"
                      placeholder="you@example.com or REG2024001"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="form-label" htmlFor="login-password">
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="login-password"
                        type={showPwd ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(v => !v)}
                        style={{
                          position: 'absolute', right: '0.75rem', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                          padding: 0, display: 'flex', alignItems: 'center',
                        }}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="login-submit"
                    className="eb-btn-primary btn w-100"
                    style={{ padding: '0.7rem', fontSize: '0.9rem', justifyContent: 'center' }}
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="eb-spinner" /> Signing in…</>
                      : <>Sign In <ArrowRight size={15} /></>
                    }
                  </button>
                </form>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <Link to="/forgot-password"
                    style={{ fontSize: '0.82rem', color: 'var(--brand-primary-light)', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ask your admin for access.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
