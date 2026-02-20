import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Network, FileText, Activity, Moon, Sun, Github, Menu, X, LogOut, Settings, Heart, Globe, Languages, Shield, Zap } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', JSON.stringify(true))
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row relative z-0 selection:bg-primary/30 selection:text-primary" dir={dir}>

      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        dir="ltr"
        className={`fixed lg:sticky top-0 h-screen w-64 glass-panel border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white glow-cyan-text">CIMEX</h1>
              <span className="text-[9px] text-cyan-400 uppercase tracking-[0.2em] font-bold">Nexus Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Mini */}
        {username && (
          <div className="p-5 border-b border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-black text-lg shadow-inner">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{username}</p>
                <p className="text-xs text-purple-400 mt-0.5">System Admin</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium overflow-hidden ${isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400" />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                )}
                <Icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-cyan-400' : 'text-white/50 group-hover:text-white/80'}`} />
                <span className="relative z-10 tracking-wide">{item.label}</span>

                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)] animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-white/5 hover:border-white/10"
            >
              <Languages size={18} />
              <span>{language === 'en' ? 'EN' : 'FA'}</span>
            </button>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-widest border border-red-500/10 hover:border-red-500/30"
            >
              <LogOut size={18} />
              <span>{t.navigation.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0" dir={dir}>
        {/* Mobile Topbar */}
        <div className="lg:hidden sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-white/70 hover:bg-white/10"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-white font-bold">
            <Shield size={20} className="text-cyan-400" />
            <span className="tracking-widest">CIMEX</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Page Content padding */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Global styles for modern scrollbars if needed */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  )
}

export default Layout
