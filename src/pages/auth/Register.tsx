import { useEffect, useState, type FormEvent } from 'react'
import { api, type User } from '../../lib/api'

interface RegisterProps {
  onLogin: (user: User) => Promise<void> | void
  onBack: () => void
}

export default function Register({ onLogin, onBack }: RegisterProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<string[]>([])

  useEffect(() => {
    api.getAvailableUnits()
      .then(setUnits)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'Unable to load available units.'))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setLoading(true)
    try {
      await onLogin(await api.register({
        name: `${String(form.get('firstName')).trim()} ${String(form.get('lastName')).trim()}`,
        unit: String(form.get('unit')),
        phone: String(form.get('phone')),
        email: String(form.get('email')),
        password: String(form.get('password')),
      }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to register.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9F8F5' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: '#0B1525' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&h=1200&fit=crop&auto=format)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(11,21,37,0.4) 0%, rgba(11,21,37,0.9) 100%)' }}
        />

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
                <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
              </svg>
            </div>
            <span className="text-white text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>SocietyHub</span>
          </div>
        </div>

        <div className="relative z-10 p-10 pb-14">
          <p className="text-[11px] font-semibold tracking-widest mb-6" style={{ color: '#818CF8', letterSpacing: '0.12em' }}>
            JOIN YOUR COMMUNITY
          </p>
          <h1 className="text-4xl leading-tight mb-5" style={{ fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
            Register your<br />
            <span style={{ color: '#C7D2FE' }}>unit today.</span>
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#94A3B8' }}>
            Connect with your society committee, track maintenance payments, raise service requests, and stay informed.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path d="M10 2L2 7v11h5v-6h6v6h5V7L10 2z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1A1917' }}>SocietyHub</span>
          </div>

          <h2 className="text-[26px] font-semibold mb-1.5" style={{ color: '#1A1917', fontFamily: 'var(--font-display)' }}>
            Create your account
          </h2>
          <p className="text-[14px] mb-8" style={{ color: '#6B6660' }}>
            Register as a resident of Sunrise Heights
          </p>

          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="Arjun"
                  className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>Unit Number</label>
              <select
                name="unit"
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
              >
                <option value="">Select your flat / unit</option>
                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>Mobile Number</label>
              <div className="flex">
                <span
                  className="px-3 py-2.5 rounded-l-lg border border-r-0 text-[14px] font-medium"
                  style={{ backgroundColor: '#F3F2EE', borderColor: '#D8D5CE', color: '#6B6660' }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="98765 43210"
                  className="flex-1 px-3.5 py-2.5 rounded-r-lg text-[14px] border focus:outline-none"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>Email Address</label>
              <input
                type="email"
                  name="email"
                  required
                placeholder="arjun@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#4A4843' }}>Set Password</label>
              <input
                type="password"
                  name="password"
                  minLength={8}
                  required
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] border focus:outline-none"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D5CE', color: '#1A1917' }}
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 rounded accent-indigo-600" />
              <span className="text-[12.5px]" style={{ color: '#6B6660' }}>
                I agree to the{' '}
                <span className="font-medium" style={{ color: '#4F46E5' }}>Terms of Service</span>
                {' '}and{' '}
                <span className="font-medium" style={{ color: '#4F46E5' }}>Privacy Policy</span>
              </span>
            </div>

            {error && <p role="alert" className="text-[12.5px]" style={{ color: '#DC2626' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-[14px] font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#4F46E5' }}
            >
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#E5E2DC' }}>
            <p className="text-[13px]" style={{ color: '#6B6660' }}>
              Already registered?{' '}
              <button type="button" onClick={onBack} className="font-semibold" style={{ color: '#4F46E5' }}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
