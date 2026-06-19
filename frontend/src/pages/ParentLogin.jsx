import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ParentLogin(){
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      const formatDobInput = (s) => {
        if(!s) return s;
        // handle HTML date input (YYYY-MM-DD) -> DDMMYYYY (no separators)
        if (s.includes('-')){
          const [y,m,d] = s.split('-');
          return `${d}${m}${y}`;
        }
        // if user typed with slashes or other separators, strip non-digits
        const digits = s.replace(/\D/g, '');
        return digits;
      }

      const res = await api.post('/auth/parent-login', { mobile, password: formatDobInput(dob) });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/');
    }catch(err){ setError(err.response?.data?.message || 'Login failed'); }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h3>Parent Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Mobile</label>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Child's Date of Birth</label>
              <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="form-control" />
            </div>
            <button className="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
