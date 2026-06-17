import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminUsers(){
  const [users, setUsers] = useState([])
  useEffect(()=>{ api.get('/users').then(r=>setUsers(r.data)).catch(()=>{}) },[])
  return (
    <div className="container py-5">
      <h3>Users</h3>
      <div className="list-group mt-3">
        {users.map(u=> (
          <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{u.name}</strong>
              <div className="small text-muted">{u.email} • {u.role}</div>
            </div>
            <div className="small text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
