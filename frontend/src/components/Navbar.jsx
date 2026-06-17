import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap, LayoutDashboard, CalendarCheck, UtensilsCrossed,
  MessageSquareWarning, Wrench, Search, BookOpen, Users, UserCog,
  School, LogOut, ChevronDown, Baby, Bell, ShieldCheck
} from 'lucide-react'

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const logged = !!localStorage.getItem('token')
  const navigate = useNavigate()
  const location = useLocation()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  const adminLinks = [
    { icon: School,             label: 'Classes',        to: '/admin/classes' },
    { icon: GraduationCap,      label: 'Students',       to: '/admin/students' },
    { icon: Users,              label: 'Teachers',       to: '/admin/teachers' },
    { icon: UserCog,            label: 'Users',          to: '/admin/users' },
    null, // divider
    { icon: CalendarCheck,      label: 'Attendance',     to: '/attendance' },
    { icon: UtensilsCrossed,    label: 'Meals & Stock',  to: '/meals' },
    { icon: MessageSquareWarning,label:'Complaints',     to: '/complaints' },
    { icon: Wrench,             label: 'Infrastructure', to: '/infrastructure' },
    { icon: Search,             label: 'Lost & Found',   to: '/lostfound' },
  ]

  const teacherLinks = [
    { icon: CalendarCheck,       label: 'Mark Attendance', to: '/attendance' },
    { icon: UtensilsCrossed,     label: 'Meal Menu & Stock',to: '/meals' },
    { icon: MessageSquareWarning,label: 'Complaints',      to: '/complaints' },
    { icon: Wrench,              label: 'Infrastructure',  to: '/infrastructure' },
    { icon: Search,              label: 'Lost & Found',    to: '/lostfound' },
  ]

  const studentLinks = [
    { icon: CalendarCheck,       label: 'View Attendance', to: '/attendance' },
    { icon: UtensilsCrossed,     label: 'Meals & Ratings', to: '/meals' },
    { icon: MessageSquareWarning,label: 'Complaints',      to: '/complaints' },
    { icon: Wrench,              label: 'Infrastructure',  to: '/infrastructure' },
    { icon: Search,              label: 'Lost & Found',    to: '/lostfound' },
  ]

  const parentLinks = [
    { icon: Baby,                label: "Child's Attendance", to: '/dashboard' },
    { icon: MessageSquareWarning,label: 'Complaints & Suggestions', to: '/complaints' },
  ]

  const maintenanceLinks = [
    { icon: Wrench, label: 'Infrastructure Issues', to: '/infrastructure' },
    { icon: Search, label: 'Lost & Found',          to: '/lostfound' },
  ]

  const RoleDropdown = ({ id, label, links }) => (
    <li className="nav-item dropdown">
      <a className="nav-link dropdown-toggle d-flex align-items-center gap-1"
        href="#" id={id} role="button" data-bs-toggle="dropdown" aria-expanded="false">
        {label}
        <ChevronDown size={13} />
      </a>
      <ul className="dropdown-menu" aria-labelledby={id}>
        {links.map((item, i) =>
          item === null
            ? <li key={`div-${i}`}><hr className="dropdown-divider" /></li>
            : (
              <li key={item.to}>
                <Link className="dropdown-item" to={item.to}>
                  <item.icon size={14} />
                  {item.label}
                </Link>
              </li>
            )
        )}
      </ul>
    </li>
  )

  return (
    <nav className="eb-navbar navbar navbar-expand-lg">
      <div className="container">
        {/* Brand */}
        <Link className="eb-navbar-brand navbar-brand" to="/">
          <div className="eb-navbar-logo-icon">
            <GraduationCap size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="eb-navbar-brand-text">EduBridge</span>
            <span className="eb-navbar-brand-sub">Smart School Portal</span>
          </div>
        </Link>

        <button className="navbar-toggler" type="button"
          data-bs-toggle="collapse" data-bs-target="#mainNav"
          aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/services')}`} to="/services">Services</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/notices')}`} to="/notices">Notices</Link>
            </li>

            {logged ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">Dashboard</Link>
                </li>

                {user?.role === 'admin'       && <RoleDropdown id="adminMenu"       label="Admin"  links={adminLinks} />}
                {user?.role === 'teacher'     && <RoleDropdown id="teacherMenu"     label="Tools"  links={teacherLinks} />}
                {user?.role === 'student'     && <RoleDropdown id="studentMenu"     label="Tools"  links={studentLinks} />}
                {user?.role === 'parent'      && <RoleDropdown id="parentMenu"      label="Tools"  links={parentLinks} />}
                {user?.role === 'maintenance' && <RoleDropdown id="maintenanceMenu" label="Tasks"  links={maintenanceLinks} />}

                <li className="nav-item ms-lg-1">
                  <Link to="/profile" className="text-decoration-none">
                    <span className="eb-role-badge">{user?.role || 'user'}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="eb-btn-logout" onClick={logout}>
                    <LogOut size={13} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-2">
                <Link className="eb-btn-primary btn" to="/login">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
