import React from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, UtensilsCrossed, MessageSquareWarning, Wrench,
  Search, Bell, ShieldCheck, BarChart3, Zap, Users, GraduationCap,
  ArrowRight, CheckCircle2, Baby
} from 'lucide-react'
import smartSchoolHero from '../smart_school_hero.png'

const modules = [
  { icon: Bell,                 label: 'Notices & Announcements' },
  { icon: CalendarCheck,        label: 'Attendance Tracking'     },
  { icon: UtensilsCrossed,      label: 'Mid-Day Meal Monitoring' },
  { icon: MessageSquareWarning, label: 'Complaints & Suggestions'},
  { icon: Wrench,               label: 'Infrastructure Reporting'},
  { icon: Search,               label: 'Lost & Found Management' },
]

const roles = [
  {
    icon: GraduationCap,
    title: 'Student',
    color: 'eb-card-sky',
    iconColor: '#0369a1',
    iconBg: 'rgba(14,165,233,.12)',
    description: 'View notices, attendance, meal schedule, and report complaints from your personal dashboard.'
  },
  {
    icon: Baby,
    title: 'Parent',
    color: 'eb-card-emerald',
    iconColor: '#059669',
    iconBg: 'rgba(16,185,129,.12)',
    description: 'Track your child\'s attendance, view exam dates, and submit suggestions to the school.'
  },
  {
    icon: Users,
    title: 'Teacher',
    color: 'eb-card-indigo',
    iconColor: '#4338ca',
    iconBg: 'rgba(99,102,241,.12)',
    description: 'Mark attendance, publish notices, manage class records and review student complaints.'
  },
  {
    icon: Wrench,
    title: 'Maintenance',
    color: 'eb-card-amber',
    iconColor: '#d97706',
    iconBg: 'rgba(245,158,11,.12)',
    description: 'View assigned issues, update repair status, and close completed maintenance tasks.'
  },
]

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Role-Based Access',
    desc: 'Students log in with registration number and DOB-based password. Strict role-based permissions for all users ensure data security.',
    color: '#4f46e5',
    bg: 'rgba(99,102,241,.08)',
  },
  {
    icon: BarChart3,
    title: 'Complete Dashboards',
    desc: 'Every user gets a tailored dashboard with exactly the tools and data they need — nothing more, nothing less.',
    color: '#0284c7',
    bg: 'rgba(14,165,233,.08)',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    desc: 'All data is live — attendance, meals, complaints and notices are updated instantly across all connected devices.',
    color: '#059669',
    bg: 'rgba(16,185,129,.08)',
  },
]

const loginOptions = [
  { icon: GraduationCap, label: 'Login as Student',   sub: 'Use your registration number',     iconColor:'#0369a1' },
  { icon: Baby,          label: 'Login as Parent',    sub: "Track your child's progress",       iconColor:'#059669' },
  { icon: Users,         label: 'Login as Teacher',   sub: 'Manage attendance & notices',       iconColor:'#4338ca' },
  { icon: ShieldCheck,   label: 'Admin Login',        sub: 'Full portal management',            iconColor:'#7c3aed' },
]

export default function Home() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="eb-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-fade-up">
              <div className="eb-hero-eyebrow">
                <GraduationCap size={12} strokeWidth={2.5} />
                Welcome to EduBridge
              </div>
              <h1 className="mb-4">
                Smarter schools<br />
                start with <span className="hero-accent">better tools</span>.
              </h1>
              <p className="lead mb-5">
                An all-in-one smart portal unifying students, parents, teachers, and school operations under a modern, transparent administration system.
              </p>
              <div className="d-flex gap-3 flex-wrap align-items-center">
                <Link className="eb-btn-primary" to="/login" style={{ padding: '0.7rem 1.75rem', fontSize: '0.9rem' }}>
                  Get Started <ArrowRight size={15} />
                </Link>
                <Link className="eb-btn-outline" to="/services" style={{ padding: '0.65rem 1.6rem', fontSize: '0.9rem' }}>
                  Learn More
                </Link>
              </div>
            </div>

            <div className="col-lg-6 animate-fade-up delay-2">
              <div className="eb-hero-card">
                <div className="eb-hero-card-header">
                  <GraduationCap size={16} color="var(--brand-primary-light)" />
                  Portal Modules
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {modules.map(({ icon: Icon, label }) => (
                    <span key={label} className="eb-module-pill">
                      <Icon size={13} />
                      {label}
                    </span>
                  ))}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0 1rem' }} />
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} color="var(--brand-accent)" />
                  Trusted by government schools across India
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES SECTION ── */}
      <section className="container py-5 my-2">
        <div className="text-center mb-5 animate-fade-up">
          <span className="eb-section-label">Role-Based Access</span>
          <h2 className="eb-section-title mb-3">Built for every user</h2>
          <p className="eb-section-desc" style={{ maxWidth: 520, margin: '0 auto' }}>
            Students, parents, teachers, administrators and maintenance staff each get tailored dashboards and workflows.
          </p>
        </div>
        <div className="row g-4">
          {roles.map((role, i) => (
            <div key={role.title} className={`col-md-6 col-lg-3 animate-fade-up delay-${i + 1}`}>
              <div className={`eb-stat-card ${role.color} h-100 d-flex flex-column`}>
                <div className="eb-stat-icon" style={{ background: role.iconBg }}>
                  <role.icon size={18} color={role.iconColor} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {role.title}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO JOIN ── */}
      <section style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f4fd 100%)', padding: '5rem 0' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-fade-up">
              <span className="eb-section-label">Getting Started</span>
              <h2 style={{ fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '1rem' }}>
                Student &amp; Parent Admissions
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Student and parent accounts are created <strong>only by school administrators</strong>. Please contact the school office for registration credentials.
              </p>
              <ul className="list-unstyled">
                {[
                  'Admin creates your account with student details',
                  'You receive your Registration Number & password',
                  'Login and access your personalised dashboard',
                ].map((step, i) => (
                  <li key={i} className="d-flex align-items-center gap-3 mb-3">
                    <span style={{
                      background: 'var(--gradient-hero)', color: '#fff',
                      borderRadius: '50%', width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login" className="eb-btn-primary mt-2" style={{ padding: '0.65rem 1.5rem' }}>
                Login to Your Account <ArrowRight size={14} />
              </Link>
            </div>

            <div className="col-lg-6 animate-fade-up delay-2">
              <div className="eb-card p-4">
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--brand-primary-light)" />
                  Portal Access
                </div>
                <div className="d-grid gap-2">
                  {loginOptions.map((item, i) => (
                    <Link to="/login" key={i} className="text-decoration-none">
                      <div
                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                        style={{ border: '1.5px solid var(--border)', transition: 'all 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary-light)'; e.currentTarget.style.background = '#f8faff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `rgba(0,0,0,0.04)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <item.icon size={16} color={item.iconColor} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                        </div>
                        <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="container py-5 my-2">
        <div className="text-center mb-5 animate-fade-up">
          <span className="eb-section-label">Why EduBridge</span>
          <h2 className="eb-section-title">Everything a school needs</h2>
        </div>
        <div className="row g-4">
          {features.map((f, i) => (
            <div key={i} className={`col-md-4 animate-fade-up delay-${i + 1}`}>
              <div className="eb-feature-card d-flex flex-column">
                <div className="eb-feature-icon-wrap" style={{ background: f.bg, color: f.color }}>
                  <f.icon size={22} />
                </div>
                <h5>{f.title}</h5>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-5 mb-2">
        <div className="container">
          <div className="p-5 rounded-4 text-center text-white position-relative overflow-hidden"
            style={{ background: 'var(--gradient-dark)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(37,99,235,.25) 0%, transparent 70%)',
            }} />
            <GraduationCap size={36} color="rgba(255,255,255,0.15)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontWeight: 800, fontSize: '2rem', position: 'relative' }}>Ready to get started?</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0.75rem auto 2rem', position: 'relative', fontSize: '0.95rem' }}>
              Contact your school administrator to get access credentials, then login to your personalised portal.
            </p>
            <Link className="btn px-5 py-3" to="/login"
              style={{ background: '#fff', color: 'var(--brand-primary)', fontWeight: 700, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: '0.9rem', position: 'relative' }}>
              Login Now <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
