import React from 'react'
import {
  GraduationCap, Baby, Users, ShieldCheck, Wrench, Search,
  Building2, Zap
} from 'lucide-react'

const services = [
  {
    icon: GraduationCap,
    title: 'Student Access',
    iconColor: '#0369a1',
    iconBg: 'rgba(14,165,233,.1)',
    desc: 'View attendance, notices, meal details, lost & found, and submit complaints via your personal dashboard.',
  },
  {
    icon: Baby,
    title: 'Parent Access',
    iconColor: '#059669',
    iconBg: 'rgba(16,185,129,.1)',
    desc: "Track your child's attendance, receive school announcements and file suggestions directly to the school.",
  },
  {
    icon: Users,
    title: 'Teacher Access',
    iconColor: '#4338ca',
    iconBg: 'rgba(99,102,241,.1)',
    desc: 'Upload notices, mark class attendance, manage meal menus, and handle student support workflows.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Dashboard',
    iconColor: '#7c3aed',
    iconBg: 'rgba(124,58,237,.1)',
    desc: 'Manage all users, review portal activity, assign maintenance tasks and monitor every module.',
  },
  {
    icon: Wrench,
    title: 'Infrastructure',
    iconColor: '#d97706',
    iconBg: 'rgba(245,158,11,.1)',
    desc: 'Report maintenance issues, update repair status and keep school facilities in top condition.',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    iconColor: '#be185d',
    iconBg: 'rgba(244,63,94,.1)',
    desc: 'Register misplaced items, report found items, and use the smart matching engine to reunite students with belongings.',
  },
]

export default function Services() {
  return (
    <div>
      {/* Hero strip */}
      <div style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f4fd 100%)', padding: '4.5rem 0 3.5rem' }}>
        <div className="container text-center">
          <span className="eb-section-label">Portal Features</span>
          <h1 style={{ fontWeight: 800, letterSpacing: '-0.7px', fontSize: 'clamp(2rem,5vw,2.75rem)', margin: '0.5rem 0 1rem' }}>
            All school services in one portal
          </h1>
          <p className="eb-section-desc" style={{ maxWidth: 560, margin: '0 auto' }}>
            Students, parents, teachers, administrators and maintenance staff can access the right tools from a single, unified dashboard.
          </p>

          {/* Mini stats */}
          <div className="d-flex justify-content-center gap-4 flex-wrap mt-4">
            {[
              { label: '6+ Modules',          icon: Building2    },
              { label: '5 User Roles',         icon: Users        },
              { label: 'Real-time Sync',       icon: Zap          },
            ].map(({ label, icon: Icon }, i) => (
              <div key={i} className="d-flex align-items-center gap-2"
                style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand-primary)', background: 'rgba(37,99,235,.08)', padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid rgba(37,99,235,.15)' }}>
                <Icon size={13} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="container py-5">
        <div className="row g-4">
          {services.map((s, i) => (
            <div key={i} className={`col-md-6 col-lg-4 animate-fade-up delay-${i + 1}`}>
              <div className="eb-feature-card d-flex flex-column">
                <div className="eb-feature-icon-wrap" style={{ background: s.iconBg, color: s.iconColor }}>
                  <s.icon size={22} />
                </div>
                <h5>{s.title}</h5>
                <p style={{ flexGrow: 1 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
