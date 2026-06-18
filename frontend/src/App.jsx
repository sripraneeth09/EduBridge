import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Notices from './pages/Notices'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStudents from './pages/admin/AdminStudents'
import AdminTeachers from './pages/admin/AdminTeachers'
import AdminClasses from './pages/admin/AdminClasses'
import Attendance from './pages/Attendance'
import MealMonitoring from './pages/MealMonitoring'
import Complaints from './pages/Complaints'
import Infrastructure from './pages/Infrastructure'
import LostFound from './pages/LostFound'
import Profile from './pages/Profile'
import Services from './pages/Services'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/services' element={<Services/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/change-password' element={<ProtectedRoute><ChangePassword/></ProtectedRoute>} />
        <Route path='/notices' element={<Notices/>} />
        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path='/admin/users' element={<ProtectedRoute role='admin'><AdminUsers/></ProtectedRoute>} />
        <Route path='/admin/students' element={<ProtectedRoute role='admin'><AdminStudents/></ProtectedRoute>} />
        <Route path='/admin/teachers' element={<ProtectedRoute role='admin'><AdminTeachers/></ProtectedRoute>} />
        <Route path='/admin/classes' element={<ProtectedRoute role='admin'><AdminClasses/></ProtectedRoute>} />
        
        {/* School Service Routes */}
        <Route path='/attendance' element={<ProtectedRoute><Attendance/></ProtectedRoute>} />
        <Route path='/meals' element={<ProtectedRoute><MealMonitoring/></ProtectedRoute>} />
        <Route path='/complaints' element={<ProtectedRoute><Complaints/></ProtectedRoute>} />
        <Route path='/infrastructure' element={<ProtectedRoute><Infrastructure/></ProtectedRoute>} />
        <Route path='/lostfound' element={<ProtectedRoute><LostFound/></ProtectedRoute>} />
        
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
      <Footer />
    </div>
  )
}
