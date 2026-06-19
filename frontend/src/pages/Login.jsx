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
        <div className="col-md-8 text-center">
          <h3 className="mb-4">Sign in</h3>
          <p className="text-muted">Choose how you'd like to sign in</p>

          <div className="d-grid gap-3 mt-4">
            <a className="btn btn-outline-primary btn-lg" href="/login/student">Student Login</a>
            <a className="btn btn-outline-primary btn-lg" href="/parent/login">Parent Login</a>
            <a className="btn btn-outline-primary btn-lg" href="/login/teacher">Teacher Login</a>
            <a className="btn btn-outline-primary btn-lg" href="/login/admin">Admin Login</a>
          </div>

          <div className="mt-4">
            <Link to="/forgot-password" className="me-3">Forgot password?</Link>
            <Link to="/register">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
