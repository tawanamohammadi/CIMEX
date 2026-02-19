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
  const [version, setVersion] = useState('v0.1.0')

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

  useEffect(() => {
    fetch('/api/status/version')
      .then(res => res.json())
      .then(data => {
        if (data.version) {
          setVersion(`v${data.version}`)
        }
      })
      .catch(() => {
        setVersion('v1.0.0')
      })
  }, [])

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
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-cyan-500/30 selection:text-cyan-200" dir={dir}>
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-pink-600/10 rounded-full blur-[120px]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQwTDUwIDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')] opacity-20"></div>
      </div>

      <div className="flex h-screen relative z-10">
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
          className={`fixed lg:static inset-y-0 left-0 w-72 glass-strong border-r border-white/10 flex flex-col z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-12 w-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDIwTDIwIDAgSCAyMExgMjAgWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-50"></div>
                  <Shield className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-sm">
                  CIMEX
                </h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                  <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">Nexus Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Mini */}
          {username && (
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner shadow-white/20">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-200 truncate">{username}</p>
                  <p className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase glow-cyan/20">Admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                  )}
                  <Icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="font-medium tracking-wide relative z-10">{item.label}</span>

                  {isActive && (
                    <div className="absolute right-4 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all group"
              >
                {darkMode ? <Sun size={18} className="group-hover:text-amber-400 transition-colors" /> : <Moon size={18} className="group-hover:text-blue-400 transition-colors" />}
                <span className="text-[10px] uppercase tracking-wider font-bold">{darkMode ? t.navigation.light : t.navigation.dark}</span>
              </button>
              <button
                onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all group"
              >
                <Languages size={18} className="group-hover:text-cyan-400 transition-colors" />
                <span className="text-[10px] uppercase tracking-wider font-bold">{language === 'en' ? 'EN' : 'FA'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="w-full relative overflow-hidden group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-black/20 border border-red-500/30 text-red-400 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(2ef,68,68,0.3)]"
            >
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/20 transition-colors"></div>
              <LogOut size={18} className="relative z-10" />
              <span className="text-sm tracking-wider uppercase relative z-10">{t.navigation.logout}</span>
            </button>

            <div className="mt-6 flex flex-col items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/5">
                <Zap size={12} className="text-yellow-400" />
                <span className="font-mono text-[10px] tracking-widest">{version}</span>
              </div>
              <a
                href="https://github.com/tawanamohammadi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                title="GitHub Repository"
              >
                <Github size={14} />
                <span>Tawana Mohammadi</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-black/20 backdrop-blur-sm" dir="ltr">
          {/* Mobile Topbar */}
          <div className="lg:hidden sticky top-0 z-30 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider">CIMEX</span>
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

export default Layout
