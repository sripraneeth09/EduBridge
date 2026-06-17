import React, { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminTeachers(){
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({ name: "", email: "", subject: "", contactNumber: "", qualification: "", designation: "" })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => { loadTeachers() }, [])

  const loadTeachers = () => {
    api.get("/school-management/teachers").then(r => setTeachers(r.data)).catch(() => {})
  }

  const submitForm = async e => {
    e.preventDefault()
    try {
      const res = await api.post("/school-management/teachers", form)
      setMessage(`Teacher created. Email: ${res.data.credentials.email} Password: ${res.data.credentials.password}`)
      setForm({ name: "", email: "", subject: "", contactNumber: "", qualification: "", designation: "" })
      loadTeachers()
    } catch (err) {
      setMessage("Error creating teacher.")
    }
  }

  const deleteTeacher = async id => {
    try {
      await api.delete("/school-management/teachers/" + id)
      loadTeachers()
    } catch (err) {
      setMessage("Error deleting teacher.")
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Teachers</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Teacher"}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {showForm && (
        <div className="card p-4 mb-4">
          <h5>Create Teacher</h5>
          <form onSubmit={submitForm} className="row g-3">
            <div className="col-md-3"><input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-md-3"><input type="email" className="form-control" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Contact Number" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} required /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
            <div className="col-12"><button className="btn btn-success">Create Teacher</button></div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr><th>Name</th><th>Email</th><th>Subject</th><th>Qualification</th><th>Designation</th><th>Contact</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t._id}>
                <td><strong>{t.user.name}</strong></td>
                <td>{t.user.email}</td>
                <td>{t.subject}</td>
                <td>{t.qualification || "-"}</td>
                <td>{t.designation || "-"}</td>
                <td>{t.contactNumber}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteTeacher(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
