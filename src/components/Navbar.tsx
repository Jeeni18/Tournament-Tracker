import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, BarChart3, Users, GitBranch, Search, LogOut, Shield, Menu, X, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import worldCupImg from '../assets/World Cup.png'

const navLinks = [
  { to: '/',          label: 'Home',      icon: Home      },
  { to: '/fixtures',  label: 'Fixtures',  icon: Calendar  },
  { to: '/standings', label: 'Standings', icon: BarChart3 },
  { to: '/rankings',  label: 'Rankings',  icon: Users     },
  { to: '/bracket',   label: 'Bracket',   icon: GitBranch },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, role, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 70)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent border-b border-white/[0.06]'
        : 'bg-[#071A3D]/98 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between" style={{ height: 64 }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img
              src={worldCupImg}
              alt="World Cup"
              className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <p className="font-bold leading-tight text-[14px] tracking-tight text-white">
                World Cup{' '}
                <span className="text-[#D4AF37]">2026</span>
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-150 ${
                    active
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/search"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/8 transition-all"
            >
              <Search size={17} />
            </Link>

            {user ? (
              <>
                {role === 'admin' && (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                    <Shield size={11} />
                    Admin
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-xl text-[13px] font-bold bg-[#D4AF37] text-[#071A3D] hover:bg-[#C4A027] transition-all shadow-lg shadow-[#D4AF37]/20"
              >
                Sign in
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-white/60 hover:bg-white/8 transition-all"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/[0.08] bg-[#071A3D]/98 backdrop-blur-xl">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-semibold mb-0.5 mx-2 transition-all ${
                    active
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[#D4AF37]' : ''} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
