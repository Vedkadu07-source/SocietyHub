import type { ReactNode } from 'react'

type Page = string

interface NavItem {
  id: Page
  label: string
  icon: ReactNode
}

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
  userName: string
  userRole: string
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="w-4 h-4 flex-shrink-0 opacity-70">{children}</span>
}

const navItems: NavItem[] = [
  {
    id: 'c-overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    id: 'c-operations',
    label: 'Operations',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2 4h12v1.5H2zm0 3.25h12v1.5H2zm0 3.25h8v1.5H2z" />
      </svg>
    ),
  },
  {
    id: 'c-treasury',
    label: 'Treasury',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
        <path d="M1.5 6.5h13" />
        <circle cx="5" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'c-notices',
    label: 'Notice Board',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
        <path d="M5 5.5h6M5 8h6M5 10.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'c-residents',
    label: 'Residents',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="6" cy="5" r="2.5" />
        <path d="M1.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" strokeLinecap="round" />
        <circle cx="12" cy="5.5" r="2" />
        <path d="M14.5 13c0-1.933-1.567-3.5-3.5-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const bottomNavItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="8" cy="8" r="2" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M6 6.5a2 2 0 0 1 4 0c0 1.5-2 2-2 3" strokeLinecap="round" />
        <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function Sidebar({ currentPage, onNavigate, onLogout, userName, userRole }: SidebarProps) {
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r"
      style={{ backgroundColor: '#F9F8F5', borderColor: '#E5E2DC' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#4F46E5' }}
          >
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
            </svg>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: '#1A1917', fontFamily: 'var(--font-display)' }}
          >
            SocietyHub
          </span>
        </div>
        <p className="text-[10px] font-medium mt-1 pl-9" style={{ color: '#9A9591', letterSpacing: '0.05em' }}>
          SUNRISE HEIGHTS
        </p>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-semibold tracking-widest mb-2 px-2" style={{ color: '#B0ACA6' }}>
          COMMITTEE
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

        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled
            title={`${item.label} is not available yet`}
            className="sh-nav-item w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon>{item.icon}</Icon>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#E5E2DC' }}>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ backgroundColor: '#4F46E5' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: '#1A1917' }}>{userName}</p>
            <p className="text-[11px]" style={{ color: '#9A9591' }}>{userRole}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="#B0ACA6" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M10 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M6.5 11L10 8 6.5 5M1 8h9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
