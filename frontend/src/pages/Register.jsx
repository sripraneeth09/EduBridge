import React from 'react'
import { Link } from 'react-router-dom'

export default function Register(){
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="eb-card overflow-hidden">
            <div className="row g-0">
              <div className="col-md-5 d-none d-md-flex" style={{background:'linear-gradient(135deg,#475569,#1e293b)',padding:'2.5rem 2rem',flexDirection:'column',justifyContent:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔒</div>
                <h3 style={{fontWeight:800,color:'#fff'}}>Registration Closed</h3>
                <p style={{color:'rgba(255,255,255,0.65)',fontSize:'0.9rem',marginTop:'0.75rem'}}>
                  Student and parent accounts are created only by school administration. Contact the school office for login credentials.
                </p>
              </div>
              <div className="col-md-7 p-4 p-lg-5">
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>ℹ️</div>
                <h4 style={{fontWeight:700}}>Admin-Only Registration</h4>
                <p className="text-muted mt-2">Self-registration is <strong>disabled</strong> to protect student data. The school administrator will:</p>
                <ol className="text-muted" style={{lineHeight:2.2,fontSize:'0.92rem'}}>
                  <li>Register students with their full academic details</li>
                  <li>Automatically create a parent account linked to the student</li>
                  <li>Share the Registration Number and DOB-based password securely</li>
                </ol>
                <div className="mt-4 p-3 rounded-3" style={{background:'#f0f4ff',border:'1px solid #c7d2fe'}}>
                  <p className="mb-2 fw-600 small" style={{fontWeight:600,color:'var(--brand-primary)'}}>💡 Already have credentials?</p>
                  <p className="text-muted small mb-0">Use your Registration Number as the username and your date of birth (DDMMYYYY format) as the initial password.</p>
                </div>
                <div className="mt-4">
                  <Link to="/login" className="eb-btn-primary btn w-100">Go to Login →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
