import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ParentDashboard(){
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  useEffect(()=>{
    if(!user) return;
    (async ()=>{
      try{
        let lookup = user.registrationNo || user.student?.registrationNo || '';
        if (!lookup && user.studentId && /^[0-9a-fA-F]{24}$/.test(user.studentId)) {
          try {
            const s = await api.get(`/school-management/students?studentId=${user.studentId}`)
            if (s.data && s.data.length && s.data[0].registrationNo) {
              lookup = s.data[0].registrationNo
              localStorage.setItem('user', JSON.stringify({ ...user, registrationNo: lookup }))
            }
          } catch (e) { /* ignore */ }
        }

        if (lookup) {
          const a = await api.get(`/attendance/student/${lookup}`);
          setAttendance(a.data.slice(0,10));
        } else {
          setAttendance([])
        }
      }catch(e){
        setAttendance([])
      }
      try{ const e = await api.get('/school/exams/upcoming'); setExams(e.data); }catch(e){ setExams([]) }
      try{ const n = await api.get('/school/notices'); setNotices(n.data.slice(0,5)); }catch(e){ setNotices([]) }
    })();
  },[]);

  if (!user) return (
    <div className="container py-4">
      <h3>Please login as a parent to view this page.</h3>
    </div>
  )

  const safeDate = d => {
    try { return new Date(d).toLocaleDateString() } catch { return '—' }
  }

  try {
    console.debug('ParentDashboard mount', { user, attendanceCount: attendance.length, examsCount: exams.length, noticesCount: notices.length })
    return (
      <div className="container py-4">
        <h3>Welcome, {user?.parentName || 'Parent'}</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Child</h5>
                <p className="card-text">{user?.studentName || user?.student?.name || '—'}</p>
                <p className="card-text">Registration No: {user?.registrationNo || user?.student?.registrationNo || '—'}</p>
                <p className="text-muted">Phone: {user?.parentPhone}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6>Recent Notices</h6>
              <ul className="list-unstyled">
                {notices.map(n=> <li key={n._id}><strong>{safeDate(n.date)}</strong> - {n.title}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Attendance (latest)</h5>
              <table className="table">
                <thead><tr><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {attendance.map(a=> <tr key={a._id}><td>{safeDate(a.date)}</td><td>{a.status}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Upcoming Exams</h5>
              <ul>
                {exams.map(x=> <li key={x._id}>{x.subject} - {safeDate(x.date)}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (err) {
    console.error('ParentDashboard render error', err)
    return (
      <div className="container py-4">
        <h3>Unable to render Parent Dashboard. Check console for details.</h3>
      </div>
    )
  }
}
