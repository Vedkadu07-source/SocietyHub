import type { ReactNode } from 'react'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
}

interface ResidentSidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  onLogout: () => void
  userName: string
  unit: string
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="w-4 h-4 flex-shrink-0 opacity-70">{children}</span>
}

const navItems: NavItem[] = [
  {
    id: 'r-dashboard',
    label: 'My Home',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
      </svg>
    ),
  },
  {
    id: 'r-payments',
    label: 'Payments',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
        <path d="M1.5 6.5h13" />
        <circle cx="5" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'r-complaints',
    label: 'Service Requests',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M2 2.5h12a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H5l-3 2V3a.5.5 0 0 1 .5-.5z" strokeLinejoin="round" />
        <path d="M5.5 6.5h5M5.5 8.5h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'r-notices',
    label: 'Notices',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
        <path d="M5 5.5h6M5 8h6M5 10.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function ResidentSidebar({ currentPage, onNavigate, onLogout, userName, unit }: ResidentSidebarProps) {
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r"
      style={{ backgroundColor: '#F9F8F5', borderColor: '#E5E2DC' }}
    >
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#4F46E5' }}>
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#1A1917', fontFamily: 'var(--font-display)' }}>
            SocietyHub
          </span>
        </div>
        <p className="text-[10px] font-medium mt-1 pl-9" style={{ color: '#9A9591', letterSpacing: '0.05em' }}>
          RESIDENT PORTAL
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[9px] font-semibold tracking-widest mb-2 px-2" style={{ color: '#B0ACA6' }}>
          MY ACCOUNT
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sh-nav-item w-full text-left ${currentPage === item.id ? 'active' : ''}`}
          >
            <Icon>{item.icon}</Icon>
            {item.label}
          </button>
        ))}

        <div className="my-4 border-t" style={{ borderColor: '#E5E2DC' }} />

        <button type="button" disabled title="Help and support is not available yet" className="sh-nav-item w-full text-left disabled:cursor-not-allowed disabled:opacity-50">
          <Icon>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M6 6.5a2 2 0 0 1 4 0c0 1.5-2 2-2 3" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </Icon>
          Help & Support
        </button>
      </nav>

      <div className="px-3 py-4 border-t" style={{ borderColor: '#E5E2DC' }}>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#059669' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: '#1A1917' }}>{userName}</p>
            <p className="text-[11px]" style={{ color: '#9A9591' }}>Unit {unit}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Sign out">
            <svg viewBox="0 0 16 16" fill="none" stroke="#B0ACA6" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M10 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M6.5 11L10 8 6.5 5M1 8h9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
