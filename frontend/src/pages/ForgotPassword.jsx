import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = e => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setSent(true)
    setError('')
    setEmail('')
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="eb-card overflow-hidden">
            <div className="row g-0">
              {/* Left panel */}
              <div className="col-12 col-md-5 d-none d-md-flex"
                style={{background:'linear-gradient(135deg,#4f46e5,#0ea5e9)',padding:'2.5rem 2rem',flexDirection:'column',justifyContent:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔑</div>
                <h3 style={{fontWeight:800,color:'#fff'}}>Password Help</h3>
                <p style={{color:'rgba(255,255,255,0.72)',fontSize:'0.9rem',marginTop:'0.75rem'}}>
                  For most school portal users, passwords are managed by the school administrator.
                </p>
                <div className="mt-4 d-flex flex-column gap-2">
                  {['Students use DOB-based password','Parents contact school admin','Teachers reset via admin'].map((tip,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.83rem',color:'rgba(255,255,255,0.75)'}}>
                      <span>✓</span><span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right form */}
              <div className="col-12 col-md-7 p-4 p-lg-5">
                {sent ? (
                  <div className="text-center py-4 animate-fade-up">
                    <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📬</div>
                    <h4 style={{fontWeight:700}}>Instructions Sent</h4>
                    <p className="text-muted mt-2">
                      If an account with that email exists, password reset instructions have been sent. Please also contact your school administrator if you need immediate access.
                    </p>
                    <Link to="/login" className="eb-btn-primary btn mt-3 px-5">Back to Login →</Link>
                  </div>
                ) : (
                  <>
                    <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🔐</div>
                    <h4 style={{fontWeight:700}}>Forgot Password?</h4>
                    <p className="text-muted small mt-1 mb-4">
                      Enter your registered email address and we'll send reset instructions.
                    </p>

                    <div className="eb-card p-3 mb-4" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
                      <p className="mb-0 small" style={{color:'#92400e'}}>
                        <strong>💡 Tip:</strong> If you are a student, your default password is your date of birth in <strong>DDMMYYYY</strong> format. Contact your school administrator if you need a reset.
                      </p>
                    </div>

                    {error && <div className="eb-alert eb-alert-error mb-3">{error}</div>}

                    <form onSubmit={submit}>
                      <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                          id="forgot-email"
                          type="email"
                          className="form-control"
                          placeholder="you@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button id="forgot-submit" className="eb-btn-primary btn w-100" style={{padding:'0.65rem'}}>
                        Send Reset Instructions
                      </button>
                    </form>

                    <div className="mt-4 text-center">
                      <Link to="/login" style={{color:'var(--brand-primary)',fontSize:'0.9rem',fontWeight:500}}>
                        ← Back to Login
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
