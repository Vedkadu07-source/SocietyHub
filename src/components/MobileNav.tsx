interface MobileNavProps {
  currentPage: string
  role: 'committee' | 'resident'
  onNavigate: (page: string) => void
}

const committeeNav = [
  {
    id: 'c-overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'c-operations',
    label: 'Ops',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M3 5h14v2H3zm0 4h14v2H3zm0 4h10v2H3z" />
      </svg>
    ),
  },
  {
    id: 'c-treasury',
    label: 'Treasury',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="2" y="5" width="16" height="11" rx="2" />
        <path d="M2 8h16" />
        <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'c-notices',
    label: 'Notices',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'c-residents',
    label: 'Residents',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <circle cx="8" cy="6" r="3" />
        <path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
        <circle cx="15" cy="7" r="2.5" />
        <path d="M18 18c0-2.485-1.567-4.5-3.5-4.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const residentNav = [
  {
    id: 'r-dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 2L2 8v12h5v-7h6v7h5V8L10 2z" />
      </svg>
    ),
  },
  {
    id: 'r-payments',
    label: 'Payments',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="2" y="5" width="16" height="11" rx="2" />
        <path d="M2 8h16" />
        <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'r-complaints',
    label: 'Requests',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M3 3h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6l-4 3V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'r-notices',
    label: 'Notices',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function MobileNav({ currentPage, role, onNavigate }: MobileNavProps) {
  const items = role === 'committee' ? committeeNav : residentNav

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}
    >
      <div className="flex">
        {items.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors"
              style={{ color: isActive ? '#4F46E5' : '#9A9591' }}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: '#4F46E5' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
