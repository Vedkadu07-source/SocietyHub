import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ResidentSidebar from './components/ResidentSidebar'
import MobileNav from './components/MobileNav'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Overview from './pages/committee/Overview'
import Operations from './pages/committee/Operations'
import Treasury from './pages/committee/Treasury'
import Residents from './pages/committee/Residents'
import CommitteeNotices from './pages/committee/Notices'
import ResidentDashboard from './pages/resident/Dashboard'
import ResidentComplaints from './pages/resident/Complaints'
import ResidentPayments from './pages/resident/Payments'
import ResidentNotices from './pages/resident/Notices'
import { api, clearToken, getToken, type User } from './lib/api'

type AuthPage = 'login' | 'register'
type CommitteePage = 'c-overview' | 'c-operations' | 'c-treasury' | 'c-residents' | 'c-notices'
type ResidentPage = 'r-dashboard' | 'r-complaints' | 'r-payments' | 'r-notices'
type Page = AuthPage | CommitteePage | ResidentPage

const committeeTitles: Record<CommitteePage, string> = {
  'c-overview': 'Overview',
  'c-operations': 'Operations',
  'c-treasury': 'Treasury',
  'c-residents': 'Residents',
  'c-notices': 'Notice Board',
}

const residentTitles: Record<ResidentPage, string> = {
  'r-dashboard': 'My Home',
  'r-payments': 'Payments',
  'r-complaints': 'Service Requests',
  'r-notices': 'Notices',
}

function MobileHeader({
  title,
  role,
  userName,
  onLogout,
}: {
  title: string
  role: 'committee' | 'resident'
  userName: string
  onLogout: () => void
}) {
  const initials = userName.split(' ').map(part => part[0]).join('').slice(0, 2)
  return (
    <header
      className="md:hidden flex items-center justify-between px-4 h-14 border-b flex-shrink-0"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
            <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
          </svg>
        </div>
        <span className="text-[14px] font-semibold" style={{ color: '#1A1917', fontFamily: 'var(--font-display)' }}>
          SocietyHub
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
          style={{ backgroundColor: role === 'committee' ? '#4F46E5' : '#059669' }}
        >
          {initials}
        </div>
        <button onClick={onLogout}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#9A9591" strokeWidth="1.5" className="w-4 h-4">
            <path d="M10 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M6.5 11L10 8 6.5 5M1 8h9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function DesktopHeader({
  title,
  role,
}: {
  title: string
  role: 'committee' | 'resident'
}) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header
      className="hidden md:flex items-center justify-between px-8 h-14 border-b flex-shrink-0"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DC' }}
    >
      <p className="text-[12.5px] font-medium" style={{ color: '#9A9591' }}>
        {dateStr}
      </p>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          disabled
          title="Notifications are not available yet"
          className="w-8 h-8 rounded-lg flex items-center justify-center border relative"
          style={{ borderColor: '#E5E2DC', backgroundColor: '#FFFFFF' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="#6B6660" strokeWidth="1.5" className="w-4 h-4">
            <path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5v2l1 1.5H2.5L3.5 8V6A4.5 4.5 0 0 1 8 1.5zM6.5 13.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
          </svg>
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#DC2626' }} />
        </button>

        {/* Role badge */}
        <div
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
          style={
            role === 'committee'
              ? { backgroundColor: '#EEF2FF', color: '#3730A3' }
              : { backgroundColor: '#DCFCE7', color: '#065F46' }
          }
        >
          {role === 'committee' ? 'Committee' : 'Resident'}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<User | null>(null)
  const [residentUnit, setResidentUnit] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setCheckingSession(false)
      return
    }
    Promise.all([api.getCurrentUser(), api.getProfile()])
      .then(([currentUser, profile]) => {
        setUser(currentUser)
        setResidentUnit(profile.resident?.unit ?? '')
        setPage(currentUser.role === 'committee' ? 'c-overview' : 'r-dashboard')
      })
      .catch(() => clearToken())
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    const endSession = () => {
      setUser(null)
      setResidentUnit('')
      setPage('login')
    }
    window.addEventListener('societyhub:unauthorized', endSession)
    return () => window.removeEventListener('societyhub:unauthorized', endSession)
  }, [])

  const handleLogin = async (signedInUser: User) => {
    const profile = await api.getProfile()
    setUser(signedInUser)
    setResidentUnit(profile.resident?.unit ?? '')
    setPage(signedInUser.role === 'committee' ? 'c-overview' : 'r-dashboard')
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setResidentUnit('')
    setPage('login')
  }

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-[14px]" style={{ backgroundColor: '#F9F8F5', color: '#6B6660' }}>Loading your SocietyHub account...</div>
  }

  // Auth screens — full screen, no shell
  if (!user) {
    if (page === 'register') {
      return <Register onLogin={handleLogin} onBack={() => setPage('login')} />
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setPage('register')}
      />
    )
  }

  // Authenticated — render within shell
  const role = user.role
  const pageTitle =
    role === 'committee'
      ? committeeTitles[page as CommitteePage] || ''
      : residentTitles[page as ResidentPage] || ''

  const renderPage = () => {
    switch (page) {
      case 'c-overview':    return <Overview onNavigate={(target) => setPage(target)} />
      case 'c-operations':  return <Operations onNavigate={(target) => setPage(target)} />
      case 'c-treasury':    return <Treasury />
      case 'c-residents':   return <Residents />
      case 'c-notices':     return <CommitteeNotices />
      case 'r-dashboard':   return <ResidentDashboard userName={user.name} />
      case 'r-complaints':  return <ResidentComplaints />
      case 'r-payments':    return <ResidentPayments />
      case 'r-notices':     return <ResidentNotices />
      default:              return <Overview onNavigate={(target) => setPage(target)} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F8F5' }}>
      {/* Desktop Sidebar */}
      {role === 'committee' ? (
        <Sidebar
          currentPage={page}
          onNavigate={(target) => setPage(target as Page)}
          onLogout={handleLogout}
          userName={user.name}
          userRole="Committee"
        />
      ) : (
        <ResidentSidebar
          currentPage={page}
          onNavigate={(target) => setPage(target as Page)}
          onLogout={handleLogout}
          userName={user.name}
          unit={residentUnit}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <MobileHeader
          title={pageTitle}
          role={role}
          userName={user.name}
          onLogout={handleLogout}
        />

        {/* Desktop header */}
        <DesktopHeader title={pageTitle} role={role} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ backgroundColor: '#F9F8F5' }}>
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav
        currentPage={page}
        role={role}
        onNavigate={(target) => setPage(target as Page)}
      />
    </div>
  )
}
