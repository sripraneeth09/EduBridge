import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, CalendarCheck, UtensilsCrossed, MessageSquareWarning,
  Wrench, Search, MapPin, Phone, Mail, ExternalLink
} from 'lucide-react'

const featureLinks = [
  { icon: CalendarCheck,       label: 'Attendance'     },
  { icon: UtensilsCrossed,     label: 'Meal Monitoring'},
  { icon: MessageSquareWarning,label: 'Complaints'     },
  { icon: Wrench,              label: 'Infrastructure' },
  { icon: Search,              label: 'Lost & Found'   },
]

export default function Footer() {
  return (
    <footer className="eb-footer">
      <div className="container">
        <div className="row g-5">
          {/* Brand column */}
          <div className="col-lg-4">
            <div className="eb-footer-logo">
              <div className="eb-footer-logo-icon">
                <GraduationCap size={16} strokeWidth={2.5} />
              </div>
              <span className="eb-footer-brand">EduBridge</span>
            </div>
            <p className="eb-footer-desc mb-4">
              A smart government school portal built for transparency, efficiency, and community — bringing students, parents, teachers and staff together.
            </p>
            <span className="eb-footer-badge">
              <MapPin size={11} />
              Made for Indian Government Schools
            </span>
          </div>

          {/* Portal links */}
          <div className="col-6 col-lg-2">
            <span className="eb-footer-heading">Portal</span>
            <Link to="/"        className="eb-footer-link">Home</Link>
            <Link to="/services" className="eb-footer-link">Services</Link>
            <Link to="/notices"  className="eb-footer-link">Notices</Link>
            <Link to="/login"    className="eb-footer-link">Login</Link>
          </div>

          {/* Features */}
          <div className="col-6 col-lg-3">
            <span className="eb-footer-heading">Features</span>
            {featureLinks.map(({ icon: Icon, label }) => (
              <div key={label} className="eb-footer-link d-flex align-items-center gap-2" style={{ cursor: 'default' }}>
                <Icon size={12} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)' }} />
                {label}
              </div>
            ))}
          </div>

          {/* About */}
          <div className="col-lg-3">
            <span className="eb-footer-heading">About</span>
            <p className="eb-footer-desc mb-3">
              EduBridge digitises school administration, making daily operations transparent and accessible for the entire school community.
            </p>
            <p className="eb-footer-desc" style={{ fontSize: '0.78rem' }}>
              Student &amp; parent accounts are created by school administrators only.
            </p>
          </div>
        </div>

        <div className="eb-footer-divider" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span className="eb-footer-bottom">
            © 2026 EduBridge Portal. All rights reserved.
          </span>
          <span className="eb-footer-bottom">
            Built for transparency &amp; community excellence.
          </span>
        </div>
      </div>
    </footer>
  )
}
