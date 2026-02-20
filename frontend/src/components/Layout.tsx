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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : true
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [version, setVersion] = useState('v1.0.0')

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row" dir={dir}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        dir="ltr"
        className={`fixed lg:sticky top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CIMEX</h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nexus Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Mini */}
        {username && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{username}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-md bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span>{darkMode ? t.navigation.light : t.navigation.dark}</span>
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-md bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            >
              <Languages size={14} />
              <span>{language === 'en' ? 'EN' : 'FA'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>{t.navigation.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0" dir={dir}>
        {/* Mobile Topbar */}
        <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Shield size={20} />
            CIMEX
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
