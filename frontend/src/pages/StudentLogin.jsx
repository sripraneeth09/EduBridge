import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { Eye, EyeOff, ArrowRight, MessageSquareWarning } from 'lucide-react'

export default function StudentLogin(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
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
        navigate('/')
      }
    } catch (err) {
      setErr(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h3>Student Login</h3>
          {err && <div className="eb-alert eb-alert-error"><MessageSquareWarning /> {err}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email or Registration No</label>
              <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required style={{ paddingRight: 'clamp(2rem, 3vw, 2.5rem)' }} />
                <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', border:'none', background:'none' }}>{showPwd ? <EyeOff /> : <Eye />}</button>
              </div>
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Signing in…' : <>Sign In <ArrowRight /></>}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
