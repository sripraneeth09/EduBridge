import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, role }){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/login" />
  if(role){
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if(!user || user.role !== role) return <Navigate to="/" />
  }
  return children
}
