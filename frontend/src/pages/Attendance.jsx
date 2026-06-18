import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { markAttendance, getAttendanceByStudent, monthlyReport } from '../services/attendanceService'
import {
  CalendarCheck, CheckCircle2, XCircle, BarChart3, Search,
  Save, Users, ChevronRight
} from 'lucide-react'

const statusBadge = s =>
  s === 'present' ? 'eb-badge-present' : s === 'absent' ? 'eb-badge-absent' : 'eb-badge-pending'

export default function Attendance() {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {}
  const [classes, setClasses]               = useState([])
  const [selectedClass, setSelectedClass]   = useState('')
  const [classStudents, setClassStudents]   = useState([])
  const [attendanceMap, setAttendanceMap]   = useState({})
  const [studentId, setStudentId]           = useState('')
  const [studentRecord, setStudentRecord]   = useState(null)
  const [date, setDate]                     = useState(new Date().toISOString().slice(0, 10))
  const [records, setRecords]               = useState([])
  const [month, setMonth]                   = useState(new Date().toISOString().slice(0, 7))
  const [report, setReport]                 = useState([])
  const [message, setMessage]               = useState('')
  const [msgType, setMsgType]               = useState('info')
  const [submitting, setSubmitting]         = useState(false)

  const notify = (msg, type = 'info') => { setMessage(msg); setMsgType(type) }

  useEffect(() => {
    if (user.role === 'teacher' || user.role === 'admin') {
      api.get('/school-management/classes').then(r => setClasses(r.data)).catch(() => {})
    }
    if (user.role === 'student') loadStudentProfile()
  }, [user.role])

  const loadStudentProfile = async () => {
    try {
      const res = await api.get(`/school-management/students?userId=${user._id || user.id}`)
      if (res.data.length) {
        const student = res.data[0]
        setStudentRecord(student)
        setStudentId(student._id)
        getAttendanceByStudent(student._id).then(r => setRecords(r.data)).catch(() => setRecords([]))
      }
    } catch { notify('Unable to load student profile.', 'error') }
  }

  const filteredClasses = user.role === 'teacher'
    ? classes.filter(cls => cls.classTeacher?._id === user.id || cls.classTeacher?._id === user._id)
    : classes

  const fetchClassStudents = async (classId, targetDate) => {
    if (!classId) { setClassStudents([]); setAttendanceMap({}); return }
    try {
      const rosterRes = await api.get(`/school-management/students?classId=${classId}`)
      const students = rosterRes.data
      setClassStudents(students)

      const attRes = await api.get(`/attendance/class/${classId}?date=${targetDate}`)
      const records = attRes.data

      const map = {}
      students.forEach(s => {
        const rec = records.find(r => r.student === s._id || r.student?._id === s._id)
        if (rec) {
          map[s._id] = rec.status === 'present'
        } else {
          map[s._id] = user.role === 'admin' ? 'pending' : true
        }
      })
      setAttendanceMap(map)
    } catch {
      setClassStudents([])
      setAttendanceMap({})
      notify('Unable to load students and attendance.', 'error')
    }
  }

  useEffect(() => {
    if (user.role === 'teacher' || user.role === 'admin') {
      fetchClassStudents(selectedClass, date)
    }
  }, [selectedClass, date])

  const togglePresent = id =>
    setAttendanceMap(prev => {
      const val = prev[id]
      const nextVal = (val === 'pending' || val === false) ? true : false
      return { ...prev, [id]: nextVal }
    })

  const submitAttendance = async e => {
    e.preventDefault()
    if (!selectedClass) { notify('Select a class first.', 'error'); return }
    if (!classStudents.length) { notify('No students in this class.', 'error'); return }
    setSubmitting(true)
    try {
      await Promise.all(classStudents.map(s => {
        const isPresent = attendanceMap[s._id] === true
        return markAttendance({ studentId: s._id, date, status: isPresent ? 'present' : 'absent' })
      }))
      notify(`Attendance saved for ${classStudents.length} students.`, 'success')
      fetchClassStudents(selectedClass, date)
    } catch { notify('Unable to save attendance. Please try again.', 'error') }
    finally { setSubmitting(false) }
  }

  const fetchRecords = async () => {
    if (!studentId) { notify('Enter a Student ID or Registration Number.', 'error'); return }
    let targetId = studentId
    if (studentId.length !== 24) {
      try {
        const res = await api.get('/school-management/students')
        const found = res.data.find(s =>
          s.registrationNo?.toLowerCase() === studentId.toLowerCase() ||
          s.user?.registrationNo?.toLowerCase() === studentId.toLowerCase()
        )
        if (found) targetId = found._id
        else { notify('No student found with that registration number.', 'error'); return }
      } catch {}
    }
    getAttendanceByStudent(targetId)
      .then(r => { setRecords(r.data); notify(`Loaded ${r.data.length} records.`, 'info') })
      .catch(() => { setRecords([]); notify('Unable to load attendance records.', 'error') })
  }

  const fetchMonthlyReport = async () => {
    try {
      const [year, monthVal] = month.split('-')
      const targetId = (user.role === 'student' || user.role === 'parent') ? studentId : ''
      const res = await monthlyReport(monthVal, year, targetId)
      setReport(res.data)
      notify(`Monthly report loaded — ${res.data.length} records.`, 'info')
    } catch { setReport([]); notify('Unable to load monthly report.', 'error') }
  }

  const stats = records.reduce((acc, item) => {
    acc.total++
    if (item.status === 'present') acc.present++
    if (item.status === 'absent') acc.absent++
    return acc
  }, { total: 0, present: 0, absent: 0 })
  const pct = stats.total ? Math.round((stats.present / stats.total) * 100) : 0

  const presentCount = classStudents.filter(s => attendanceMap[s._id] === true).length
  const absentCount  = classStudents.filter(s => attendanceMap[s._id] === false).length
  const pendingCount = classStudents.filter(s => attendanceMap[s._id] === 'pending').length

  return (
    <div className="container py-5">
      {/* Page header */}
      <div className="eb-page-header animate-fade-up">
        <div className="d-flex align-items-center gap-2 mb-1">
          <CalendarCheck size={20} color="var(--brand-primary-light)" />
          <h2 style={{ margin: 0 }}>Attendance</h2>
        </div>
        <p>Online attendance management and student history for school operations.</p>
      </div>

      {message && (
        <div className={`eb-alert eb-alert-${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : 'info'} mb-4 animate-fade`}>
          {message}
        </div>
      )}

      <div className="row g-4 mt-1">
        {/* Teacher / Admin — Class Attendance */}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <div className="col-lg-7 animate-fade-up delay-1">
            <div className="eb-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4">
                <Users size={16} color="var(--brand-primary-light)" />
                <h5 style={{ fontWeight: 700, margin: 0 }}>Class Attendance</h5>
              </div>

              <form onSubmit={submitAttendance}>
                <div className="row g-3 mb-3">
                  <div className={user.role === 'admin' ? "col-md-8" : "col-12"}>
                    <label className="form-label">Class / Section</label>
                    <select className="form-select" value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}>
                      <option value="">Select Class / Section</option>
                      {filteredClasses.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {`${cls.name} — Grade ${cls.grade} ${cls.section || ''}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={user.role === 'admin' ? "col-md-4" : "col-md-6"}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={date}
                      onChange={e => setDate(e.target.value)} required />
                  </div>
                  {user.role !== 'admin' && (
                    <div className="col-md-6 d-flex align-items-end">
                      <button className="eb-btn-primary btn w-100" disabled={submitting || !classStudents.length}>
                        {submitting
                          ? <><span className="eb-spinner" />Saving…</>
                          : <><Save size={14} />Save Attendance</>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary bar */}
                {classStudents.length > 0 && (
                  <div className="d-flex flex-wrap gap-3 mb-3 p-3 rounded-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={14} color="#059669" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>
                        {presentCount} Present
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <XCircle size={14} color="#dc2626" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#dc2626' }}>
                        {absentCount} Absent
                      </span>
                    </div>
                    {pendingCount > 0 && (
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#92400e' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>
                          {pendingCount} Pending / Not Marked
                        </span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {classStudents.length} total
                    </span>
                  </div>
                )}

                {classStudents.length > 0 && (
                  <div className="table-responsive">
                    <table className="eb-table table table-borderless mb-0">
                      <thead>
                        <tr>
                          <th>Reg No</th>
                          <th>Student Name</th>
                          <th style={{ textAlign: 'center' }}>Present</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map(student => {
                          const status = attendanceMap[student._id]
                          const isPresent = status === true
                          const isPending = status === 'pending'
                          return (
                            <tr key={student._id}>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {student.registrationNo || student.user?.registrationNo || '—'}
                              </td>
                              <td style={{ fontWeight: 600 }}>{student.user?.name || '—'}</td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  className="eb-checkbox-attendance"
                                  id={`att-${student._id}`}
                                  checked={isPresent}
                                  disabled={user.role === 'admin'}
                                  onChange={() => {
                                    if (user.role !== 'admin') {
                                      togglePresent(student._id)
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`eb-badge ${isPresent ? 'eb-badge-present' : isPending ? 'eb-badge-pending' : 'eb-badge-absent'}`}>
                                  {isPresent ? 'Present' : isPending ? 'Pending / Not Marked' : 'Absent'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Attendance Viewer */}
        <div className={`col-lg-${(user.role === 'teacher' || user.role === 'admin') ? '5' : '12'} animate-fade-up delay-2`}>
          <div className="eb-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Search size={16} color="var(--brand-primary-light)" />
              <h5 style={{ fontWeight: 700, margin: 0 }}>Attendance Viewer</h5>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Review attendance history for a student.
            </p>

            <div className="input-group mb-4">
              {(user.role === 'teacher' || user.role === 'admin' || user.role === 'parent') && (
                <input value={studentId} onChange={e => setStudentId(e.target.value)}
                  className="form-control" placeholder="Student ID or Registration No" />
              )}
              {user.role === 'student' && (
                <input value={studentRecord?.registrationNo || ''} readOnly className="form-control"
                  style={{ background: 'var(--surface-1)' }} />
              )}
              <button className="eb-btn-primary btn" onClick={fetchRecords}>Load</button>
            </div>

            {stats.total > 0 && (
              <>
                <div className="row g-2 mb-3">
                  {[
                    { label: 'Total',   value: stats.total,   bg: '#f1f5f9', color: '#475569' },
                    { label: 'Present', value: stats.present, bg: '#dcfce7', color: '#15803d' },
                    { label: 'Absent',  value: stats.absent,  bg: '#fee2e2', color: '#dc2626' },
                  ].map(s => (
                    <div key={s.label} className="col-4">
                      <div style={{ background: s.bg, borderRadius: 10, padding: '0.7rem 0.5rem', textAlign: 'center', border: '1px solid rgba(0,0,0,.04)' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="eb-progress-bar mb-1">
                  <div className="eb-progress-fill" style={{
                    width: `${pct}%`,
                    background: pct >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)' : pct >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                  }} />
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance rate</span>
                  <span style={{ fontWeight: 700, color: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>
                    {pct}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="eb-card p-4 mt-4 animate-fade-up">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-2">
            <BarChart3 size={16} color="var(--brand-primary-light)" />
            <h5 style={{ fontWeight: 700, margin: 0 }}>Attendance History</h5>
          </div>
          <div className="input-group" style={{ maxWidth: 300 }}>
            <input type="month" className="form-control" value={month}
              onChange={e => setMonth(e.target.value)} />
            <button className="eb-btn-primary btn" onClick={fetchMonthlyReport}>
              Monthly Report
            </button>
          </div>
        </div>

        {report.length ? (
          <div className="table-responsive">
            <table className="eb-table table table-borderless mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Registration No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map(record => (
                  <tr key={record._id}>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{record.student?.user?.name || 'Student'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                      {record.student?.user?.registrationNo || '—'}
                    </td>
                    <td>
                      <span className={`eb-badge ${statusBadge(record.status)}`}>{record.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <CalendarCheck size={36} color="#e2e8f0" style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Select a month and click "Monthly Report" to view records.</p>
          </div>
        )}
      </div>
    </div>
  )
}
