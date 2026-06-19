import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../services/authService'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setErr('')
    setSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErr('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setErr('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setErr('New password must be at least 6 characters')
      return
    }

    if (oldPassword === newPassword) {
      setErr('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        oldPassword,
        newPassword,
      })
      setSuccess('Password changed successfully! Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setErr(err?.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="eb-card animate-scale">
            <div className="text-center mb-4">
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <Lock size={28} color="#3B82F6" />
              </div>
              <h2 className="mb-2">Change Password</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Your password was reset by the admin. Please set a new password to continue.
              </p>
            </div>

            <form onSubmit={submit}>
              {/* Old Password */}
              <div className="mb-3">
                <label htmlFor="oldPassword" className="form-label">
                  Current Password (Reset Password)
                </label>
                <div className="input-group">
                  <input
                    id="oldPassword"
                    type={showOld ? 'text' : 'password'}
                    className="form-control eb-input"
                    placeholder="Enter temporary password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn eb-btn-icon"
                    onClick={() => setShowOld(!showOld)}
                    disabled={loading}
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="input-group">
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    className="form-control eb-input"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn eb-btn-icon"
                    onClick={() => setShowNew(!showNew)}
                    disabled={loading}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  className="form-control eb-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {err && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                  <span style={{ marginRight: '0.75rem' }}>⚠️</span>
                  {err}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                  <CheckCircle2 size={18} style={{ marginRight: '0.75rem' }} />
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn eb-btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginTop: '1rem' }}>
                Make sure your new password is strong and unique.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
