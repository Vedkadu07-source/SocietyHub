import { useState, type FormEvent } from 'react'
import { api, type User } from '../../lib/api'

interface LoginProps {
  onLogin: (user: User) => Promise<void> | void
  onRegister: () => void
}

export default function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin(await api.login(email, password))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9F8F5' }}>
      {/* Left panel — brand / visual */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: '#0B1525' }}
      >
        {/* Architectural image overlay */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=1200&fit=crop&auto=format)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(11,21,37,0.3) 0%, rgba(11,21,37,0.7) 60%, rgba(11,21,37,0.95) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
                <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
              </svg>
            </div>
            <span className="text-white text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              SocietyHub
            </span>
          </div>
        </div>

        <div className="relative z-10 p-10 pb-14">
          <p className="text-[11px] font-semibold tracking-widest mb-6" style={{ color: '#818CF8', letterSpacing: '0.12em' }}>
            RESIDENTIAL MANAGEMENT
          </p>
          <h1
            className="text-4xl leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)', color: '#FFFFFF' }}
          >
            Your community,<br />
            <span style={{ color: '#C7D2FE' }}>thoughtfully managed.</span>
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#94A3B8' }}>
            Transparent governance, seamless communication, and effortless administration — purpose-built for residential societies.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['PM', 'AS', 'KN', 'RM'].map((i, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ borderColor: '#0B1525', backgroundColor: ['#4F46E5', '#059669', '#D97706', '#2563EB'][idx] }}
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-[13px]" style={{ color: '#64748B' }}>
              Resident services and community governance in one place
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>
              SocietyHub
            </span>
          </div>

          <h2 className="text-[26px] font-semibold mb-1.5" style={{ color: '#1A1917', fontFamily: 'var(--font-display)' }}>
            Welcome back
          </h2>
          <p className="text-[14px] mb-8" style={{ color: '#6B6660' }}>
            Sign in to your SocietyHub account
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843', letterSpacing: '0.02em' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D8D5CE',
                  color: '#1A1917',
                  '--tw-ring-color': '#C7D2FE',
                } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843', letterSpacing: '0.02em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D8D5CE',
                  color: '#1A1917',
                  '--tw-ring-color': '#C7D2FE',
                } as React.CSSProperties}
              />
            </div>

            {error && <p role="alert" className="text-[12.5px]" style={{ color: '#DC2626' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ backgroundColor: '#4F46E5' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#E5E2DC' }}>
            <p className="text-[13px]" style={{ color: '#6B6660' }}>
              New to SocietyHub?{' '}
              <button onClick={onRegister} className="font-semibold" style={{ color: '#4F46E5' }}>
                Register your unit
              </button>
            </p>
          </div>

          <p className="text-center text-[11px] mt-8" style={{ color: '#B0ACA6' }}>
            SocietyHub account access
          </p>
        </div>
      </div>
    </div>
  )
}
