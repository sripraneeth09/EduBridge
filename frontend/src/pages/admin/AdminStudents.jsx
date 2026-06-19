import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import studentService from '../../services/studentService'

export default function AdminStudents(){
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ name: '', email: '', rollNo: '', className: '', section: '', gender: '', dateOfBirth: '', parentName: '', parentPhone: '', admissionNo: '', address: '' })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [importSummary, setImportSummary] = useState(null)
  const [importing, setImporting] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => { setPage(1); }, [q, filterClass, filterSection])
  useEffect(() => { loadStudents(); }, [page, q, filterClass, filterSection])
  useEffect(() => { loadClasses() }, [])

  const loadStudents = async () => {
    console.log('AdminStudents.loadStudents', { page, limit, q, filterClass, filterSection })
    try{
      const res = await studentService.list({ page, limit, q, className: filterClass, section: filterSection })
      console.log('AdminStudents.loadStudents response', res.data)
      setStudents(res.data.students)
      setTotal(res.data.total)
    }catch(e){
      console.error('AdminStudents.loadStudents error', e)
      setMessage('Failed loading students')
    }
  }

  const loadClasses = () => {
    api.get('/school-management/classes').then(r => setClasses(r.data)).catch(() => {})
  }

  const submitForm = async e => {
    e.preventDefault()
    try{
      if (form._id) {
        await studentService.update(form._id, form)
        setMessage('Student updated')
      } else {
        await studentService.create(form)
        setMessage('Student created')
      }
      setForm({ name: '', email: '', rollNo: '', className: '', section: '', gender: '', dateOfBirth: '', parentName: '', parentPhone: '', admissionNo: '', address: '' })
      setShowForm(false)
      loadStudents()
    }catch(err){
      setMessage(err.response?.data?.message || 'Error saving student')
    }
  }

  const deleteStudent = async id => {
    if(!window.confirm('Delete this student?')) return
    try{ await studentService.remove(id); setMessage('Deleted'); loadStudents() }catch(e){ setMessage('Delete failed') }
  }

  const handleImport = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!file) return setMessage('Select a file first')

    console.log('AdminStudents.handleImport start', { fileName: file.name, fileSize: file.size })
    setImporting(true)
    setImportSummary(null)
    setMessage('Importing students...')

    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await studentService.import(fd)
      console.log('AdminStudents.handleImport success', res.data)
      setImportSummary(res.data)
      setMessage(`Import completed: ${res.data.imported} imported, ${res.data.skipped} skipped`)
      await loadStudents()
      console.log('AdminStudents.handleImport loadStudents complete')
    } catch (err) {
      console.error('AdminStudents.handleImport error', err.response?.data || err.message || err)
      const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data)
      setMessage(serverMessage || 'Import failed')
      setImportSummary(null)
    } finally {
      console.log('AdminStudents.handleImport finally')
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try{
      const res = await studentService.export()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'students.xlsx'; a.click();
      window.URL.revokeObjectURL(url)
    }catch(e){ setMessage('Export failed') }
  }

  const handleTemplate = async () => {
    try{
      const res = await studentService.template()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'students-template.xlsx'; a.click();
      window.URL.revokeObjectURL(url)
    }catch(e){ setMessage('Template download failed') }
  }

  const formatDob = (value) => {
    if (!value) return '-'
    if (/^\d{8}$/.test(value)) return `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`
    return value
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Student Management</h3>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'Add Student'}</button>
          <button className="btn btn-outline-success me-2" onClick={handleExport}>Export Students</button>
          <button className="btn btn-outline-primary" onClick={handleTemplate}>Download Template</button>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {importSummary && (
        <div className="alert alert-success">
          <p><strong>Import summary:</strong> {importSummary.imported} imported, {importSummary.skipped} skipped, {importSummary.total} total.</p>
          {importSummary.createdUsers?.length > 0 && (
            <div>
              <p><strong>Created login details:</strong></p>
              <ul className="mb-0">
                {importSummary.createdUsers.map((u, index) => (
                  <li key={index}>{u.admissionNo}: {u.password}</li>
                ))}
              </ul>
            </div>
          )}
          {importSummary.errors?.length > 0 && (
            <div className="mt-2">
              <p><strong>Row errors:</strong></p>
              <ul className="mb-0">
                {importSummary.errors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>Row {err.row}: {err.reason}</li>
                ))}
                {importSummary.errors.length > 5 && <li>...and {importSummary.errors.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="card p-4 mb-4">
          <h5>{form._id ? 'Edit Student' : 'Create Student'}</h5>
          <form onSubmit={submitForm} className="row g-3">
            <div className="col-12 col-md-4"><input className="form-control" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-12 col-md-4"><input type="email" className="form-control" placeholder="Email (optional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="Roll Number" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} required /></div>
            <div className="col-12 col-md-3">
              <select className="form-select" value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c.name}>{`${c.name}`}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3"><input className="form-control" placeholder="Section" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></div>
            <div className="col-12 col-md-3">
              <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-12 col-md-3"><input type="date" className="form-control" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="Admission Number" value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} required /></div>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="Parent Name" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} /></div>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="Parent Phone" value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} /></div>
            <div className="col-12"><input className="form-control" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="col-12"><button className="btn btn-success">{form._id ? 'Update' : 'Create Student'}</button></div>
          </form>
        </div>
      )}

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-sm-6 col-md-3"><input className="form-control" placeholder="Search by name, roll or admission" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="col-12 col-sm-6 col-md-2">
            <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">Filter Class</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-2"><input className="form-control" placeholder="Filter Section" value={filterSection} onChange={e => setFilterSection(e.target.value)} /></div>
          <div className="col-12 col-sm-6 col-md-2">
            <input type="file" accept=".csv,.xls,.xlsx" onChange={e => setFile(e.target.files[0])} className="form-control" disabled={importing} />
          </div>
          <div className="col-12 col-md-3 text-md-end">
            <button className="btn btn-primary me-2" onClick={handleImport} disabled={importing}>{importing ? 'Importing...' : 'Import'}</button>
            <small className="text-muted">Use template for exact columns</small>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Admission No</th>
              <th>Class</th>
              <th>Section</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Parent Name</th>
              <th>Parent Phone</th>
              <th>Address</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.rollNo}</td>
                <td>{s.admissionNo}</td>
                <td>{s.className || '-'}</td>
                <td>{s.section || '-'}</td>
                <td>{s.gender || '-'}</td>
                <td>{formatDob(s.dateOfBirth)}</td>
                <td>{s.parentName || '-'}</td>
                <td>{s.parentPhone || '-'}</td>
                <td>{s.address || '-'}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setForm(s); setShowForm(true) }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div>Showing {students.length} of {total}</div>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" disabled={page<=1} onClick={() => setPage(p => p-1)}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={students.length<limit} onClick={() => setPage(p => p+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
