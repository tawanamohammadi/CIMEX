import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Shield, Activity, Cpu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'
import api from '../api/client'
import CimexLogoDark from '../assets/CIMEX_dark.svg'
import CimexLogoLight from '../assets/CIMEX_light.svg'

const Login = () => {
  const [username, setUsername] = useState('')
  const [version, setVersion] = useState('v1.0.0')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : true // Default to dark for CIMEX
  })
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const { t, dir } = useLanguage()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    api.get('/status/version')
      .then(res => {
        if (res.data.version) {
          setVersion(`v${res.data.version}`)
        }
      })
      .catch(() => {
        setVersion('v1.0.0')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      })

      login(response.data.access_token, response.data.username)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || t.login.checkCredentials)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 overflow-hidden relative" dir={dir}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative glass p-6 rounded-3xl border-primary/20 hover:border-primary/40 transition-colors duration-500">
                <div className="text-5xl font-black gradient-text tracking-tighter">CIMEX</div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] gradient-text mb-2">
            {t.login.title}
          </h1>
          <p className="text-gray-400 font-medium tracking-wide uppercase text-xs opacity-70">{t.login.subtitle}</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-3xl border-white/5 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"></div>

          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {t.login.signIn}
              </h2>
            </div>
            <button
              onClick={() => {
                setDarkMode(!darkMode)
                localStorage.setItem('darkMode', JSON.stringify(!darkMode))
              }}
              className="p-3 rounded-2xl glass hover:bg-white/10 text-gray-400 transition-all border-white/5"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl"
            >
              <p className="text-sm text-destructive font-medium text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                {t.login.username}
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                  placeholder={t.login.usernamePlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                {t.login.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                placeholder={t.login.passwordPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-white text-black font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-3 transition-transform group-hover:scale-[0.98] active:scale-95">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.login.signingIn}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{t.login.signIn}</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border-white/5 text-xs text-gray-400">
            <span>Made with</span>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>❤️</motion.span>
            <span>by</span>
            <a
              href="https://github.com/tawanamohammadi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:glow-cyan font-bold transition-all"
            >
              Tawana Mohammadi
            </a>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">
            <span>{version}</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span>Secure System</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span>Encrypted</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>
    </div>
  )
}

export default Login
