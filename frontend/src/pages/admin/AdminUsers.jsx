import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { RotateCcw, Copy, Check, AlertCircle } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [resetModal, setResetModal] = useState({ show: false, userId: null, userName: '' })
  const [tempPassword, setTempPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    api.get('/users').then(r => setUsers(r.data)).catch(() => {})
  }

  const handleResetClick = (userId, userName) => {
    setResetModal({ show: true, userId, userName })
    setTempPassword('')
    setCopied(false)
    setError('')
  }

  const handleResetPassword = async () => {
    setResetting(true)
    setError('')
    try {
      const res = await api.put(`/users/${resetModal.userId}/reset-password`)
      setTempPassword(res.data.temporaryPassword)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container py-5">
      <h3>Users</h3>
      <div className="list-group mt-3">
        {users.map(u => (
          <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{u.name}</strong>
              <div className="small text-muted">{u.email} • {u.role}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
              <button
                className="btn btn-sm eb-btn-primary"
                onClick={() => handleResetClick(u._id, u.name)}
                title="Reset password"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reset Password Modal */}
      {resetModal.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setResetModal({ show: false, userId: null, userName: '' })}
                  disabled={resetting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>User:</strong> {resetModal.userName}
                </p>

                {!tempPassword && (
                  <>
                    <div className="alert alert-info d-flex gap-2 mb-3">
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      <span>
                        A temporary password will be generated. Share it with the user offline, and they will be prompted to change it on login.
                      </span>
                    </div>

                    {error && (
                      <div className="alert alert-danger mb-3">{error}</div>
                    )}

                    <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      Click the button below to generate a temporary password.
                    </p>
                  </>
                )}

                {tempPassword && (
                  <div>
                    <label className="form-label">Temporary Password:</label>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={tempPassword}
                        readOnly
                        style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={copyToClipboard}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-success small">✓ Copied to clipboard</p>
                    )}
                    <div className="alert alert-warning">
                      <strong>⚠️ Important:</strong> Share this password with the user offline (in-person). They will be required to change it on their first login.
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetModal({ show: false, userId: null, userName: '' })}
                  disabled={resetting}
                >
                  Close
                </button>
                {!tempPassword && (
                  <button
                    type="button"
                    className="btn eb-btn-primary"
                    onClick={handleResetPassword}
                    disabled={resetting}
                  >
                    {resetting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={16} className="me-2" style={{ display: 'inline' }} />
                        Generate Temporary Password
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
