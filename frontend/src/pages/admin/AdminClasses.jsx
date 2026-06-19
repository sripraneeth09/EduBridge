import React, { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminClasses(){
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({ name: "", grade: "", section: "", classTeacher: "", description: "" })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadClasses()
    loadTeachers()
  }, [])

  const loadClasses = () => {
    api.get("/school-management/classes").then(r => setClasses(r.data)).catch(() => {})
  }

  const loadTeachers = () => {
    api.get("/school-management/teachers").then(r => setTeachers(r.data)).catch(() => {})
  }

  const submitForm = async e => {
    e.preventDefault()
    try {
      await api.post("/school-management/classes", form)
      setMessage("Class created successfully.")
      setForm({ name: "", grade: "", section: "", classTeacher: "", description: "" })
      loadClasses()
    } catch (err) {
      setMessage("Error creating class.")
    }
  }

  const deleteClass = async id => {
    try {
      await api.delete("/school-management/classes/" + id)
      loadClasses()
    } catch (err) {
      setMessage("Error deleting class.")
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Classes</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Class"}
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {showForm && (
        <div className="card p-4 mb-4">
          <h5>Create Class</h5>
          <form onSubmit={submitForm} className="row g-3">
            <div className="col-12 col-md-3"><input className="form-control" placeholder="Class Name (e.g., 10A)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-12 col-md-3"><input type="number" className="form-control" placeholder="Grade (10, 9, 8...)" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} required /></div>
            <div className="col-12 col-md-3"><input className="form-control" placeholder="Section (A, B, C...)" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></div>
            <div className="col-12 col-md-3">
              <select className="form-select" value={form.classTeacher} onChange={e => setForm({ ...form, classTeacher: e.target.value })}>
                <option value="">Class Teacher</option>
                {teachers.map(t => <option key={t._id} value={t.user._id}>{t.user.name}</option>)}
              </select>
            </div>
            <div className="col-12"><textarea className="form-control" rows="2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-12"><button className="btn btn-success">Create Class</button></div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr><th>Class</th><th>Grade</th><th>Section</th><th>Class Teacher</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls._id}>
                <td><strong>{cls.name}</strong></td>
                <td>{cls.grade}</td>
                <td>{cls.section || "-"}</td>
                <td>{cls.classTeacher?.name || "-"}</td>
                <td>{cls.description || "-"}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteClass(cls._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
