import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Network, FileText, Activity, LogOut, Settings, Heart, Globe, Languages, Shield, Menu, X, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, username } = useAuth()
  const { language, setLanguage, dir, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', JSON.stringify(true))

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/dashboard', label: t.navigation.dashboard, icon: LayoutDashboard },
    { path: '/nodes', label: t.navigation.nodes, icon: Network },
    { path: '/servers', label: t.navigation.servers, icon: Globe },
    { path: '/tunnels', label: t.navigation.tunnels, icon: Activity },
    { path: '/core-health', label: t.navigation.coreHealth, icon: Heart },
    { path: '/logs', label: t.navigation.logs, icon: FileText },
    { path: '/settings', label: t.navigation.settings, icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative z-0 selection:bg-cyan-500/30 selection:text-cyan-200" dir={dir}>

      {/* Immersive Space Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#02040a]">
        {/* Glow Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBMMjkuNSAwdjYwIi8+PHBhdGggZD0iTTI5LjUgMGwzMC41IDYwdjYwIiBvcGFjaXR5PSIwLjUiLz48L2c+PC9zdmc+')] opacity-20" />
      </div>

      {/* Floating Top Navigation (Desktop) */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 px-4' : 'py-4 px-4 sm:px-6'}`}>
        <div className={`max-w-7xl mx-auto glass-panel rounded-2xl border border-white/10 flex items-center justify-between transition-all duration-500 ${scrolled ? 'px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-card/60' : 'px-6 py-3 bg-card/40'}`}>

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              <Shield size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-white glow-cyan-text">CIMEX <span className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold align-top ml-1">Nexus</span></h1>
            </div>
            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2 text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-black/20 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold overflow-hidden group ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent border-t border-cyan-400" />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                  )}
                  <Icon size={16} className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-white/50 group-hover:text-white/80'}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-white/5"
            >
              <Languages size={16} />
              <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'FA'}</span>
            </button>
            <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

            {username && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                <User size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-white tracking-widest uppercase">{username}</span>
              </div>
            )}

            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-widest border border-red-500/10"
              title={t.navigation.logout}
            >
              <LogOut size={16} className="sm:hidden" />
              <span className="hidden sm:flex items-center gap-1.5">
                <LogOut size={14} />
                {t.navigation.logout}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[80px] z-40 lg:hidden p-4 animation-fade-in bg-background/95 backdrop-blur-3xl overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-bold ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400 text-white shadow-inner'
                    : 'bg-white/5 text-white/70 active:bg-white/10 border border-white/5'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-cyan-400 shadow-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : ''} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full min-h-screen">
        <div className="flex-1 animation-fade-up">
          {children}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animation-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animation-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}

export default Layout
