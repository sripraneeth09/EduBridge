import React, { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminStudents(){
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ name: "", email: "", rollNo: "", class: "", dateOfBirth: "", parentName: "", parentPhone: "", parentEmail: "", admissionNo: "" })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadStudents()
    loadClasses()
  }, [])

  const loadStudents = () => {
    api.get("/school-management/students").then(r => setStudents(r.data)).catch(() => {})
  }

  const loadClasses = () => {
    api.get("/school-management/classes").then(r => setClasses(r.data)).catch(() => {})
  }

  const submitForm = async e => {
    e.preventDefault()
    try {
      const res = await api.post("/school-management/students", form)
      setMessage(`Student created. Registration: ${res.data.credentials.registrationNo} Password: ${res.data.credentials.password}`)
      setForm({ name: "", email: "", rollNo: "", class: "", dateOfBirth: "", parentName: "", parentPhone: "", parentEmail: "", admissionNo: "" })
      loadStudents()
    } catch (err) {
      setMessage('Error creating student.')
    }
  }

  const deleteStudent = async id => {
    try {
      await api.delete("/school-management/students/" + id)
      setMessage('Student deleted.')
      loadStudents()
    } catch (err) {
      setMessage('Error deleting student.')
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Students</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Student"}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {showForm && (
        <div className="card p-4 mb-4">
          <h5>Create Student</h5>
          <form onSubmit={submitForm} className="row g-3">
            <div className="col-md-4"><input className="form-control" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-md-4"><input type="email" className="form-control" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Roll Number" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} required /></div>
            <div className="col-md-4">
              <select className="form-select" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{`${c.name} / Grade ${c.grade} ${c.section ? '- ' + c.section : ''}`}</option>)}
              </select>
            </div>
            <div className="col-md-4"><input type="date" className="form-control" placeholder="Date of Birth" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Admission Number" value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Parent Name" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} required /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Parent Phone" value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} required /></div>
            <div className="col-md-4"><input type="email" className="form-control" placeholder="Parent Email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} /></div>
            <div className="col-12"><button className="btn btn-success">Create Student</button></div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr><th>Registration No</th><th>Name</th><th>Email</th><th>Roll</th><th>Class</th><th>Parent Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.registrationNo || s.user.registrationNo || '-'}</td>
                <td><strong>{s.user.name}</strong></td>
                <td>{s.user.email}</td>
                <td>{s.rollNo}</td>
                <td>{s.class?.name || '-'}</td>
                <td>{s.parentPhone || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
