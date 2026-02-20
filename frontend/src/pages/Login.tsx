import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'
import api from '../api/client'

const Login = () => {
  const [username, setUsername] = useState('')
  const [version, setVersion] = useState('v1.0.0')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : true
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
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 selection:bg-primary/30 selection:text-primary" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            CIMEX PANEL
          </h1>
          <p className="text-muted-foreground text-sm font-medium">{t.login.subtitle}</p>
        </div>

        <div className="bg-card border border-border shadow-md rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">
              {t.login.signIn}
            </h2>
            <button
              onClick={() => {
                setDarkMode(!darkMode)
              }}
              className="p-2 rounded-lg bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                {t.login.username}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                placeholder={t.login.usernamePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                {t.login.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                placeholder={t.login.passwordPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-xl transition-colors mt-6 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.login.signingIn}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.login.signIn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-medium">
          <span>{version}</span>
          <span>•</span>
          <a
            href="https://github.com/tawanamohammadi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Tawana Mohammadi
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
