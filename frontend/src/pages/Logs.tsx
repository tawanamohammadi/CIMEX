import { useEffect, useState, useRef } from 'react'
import { Terminal, Download, Play, Pause, Trash2, Copy, CheckCircle, ArrowDownToLine, Activity } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

const Logs = () => {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const logEndRef = useRef<HTMLDivElement>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(() => {
      if (!isPaused) fetchLogs()
    }, 2000)
    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    if (shouldAutoScroll && logEndRef.current && !isPaused) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, shouldAutoScroll, isPaused])

  useEffect(() => {
    const container = logContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldAutoScroll(isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs?limit=300')
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'fatal':
        return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]'
      case 'warning':
      case 'warn':
        return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
      case 'info':
        return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
      case 'debug':
        return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]'
      default:
        return 'text-white/60'
    }
  }

  const copyLogs = async () => {
    try {
      const logText = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')
      await navigator.clipboard.writeText(logText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy logs', err)
    }
  }

  const downloadLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cimex-core-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const scrollToBottom = () => {
    setShouldAutoScroll(true)
    setIsPaused(false)
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="text-cyan-400 w-12 h-12 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        <p className="text-white/60 text-sm font-bold tracking-widest uppercase">Initializing Telemetry Stream...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 text-white glow-cyan-text flex items-center gap-3">
            <Terminal className="text-cyan-400 w-8 h-8" />
            {t.logs.title}
          </h1>
          <p className="text-white/60 text-sm">{t.logs.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs tracking-wider uppercase border
              ${isPaused
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/5'}`}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={copyLogs}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-white/5"
          >
            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
            <span className={copied ? "text-green-400" : ""}>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={downloadLogs}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-white/5"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-red-500/30 hover:border-red-500/50"
          >
            <Trash2 size={16} />
            <span>Clear Buffer</span>
          </button>
        </div>
      </div>

      <div className="glass-panel flex-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-50 z-10 pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-cyan-500 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,1)]'}`}></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{isPaused ? 'STREAM PAUSED' : 'LIVE STREAM'}</span>
        </div>

        <div
          ref={logContainerRef}
          className="flex-1 overflow-auto p-6 font-mono text-[13px] leading-relaxed custom-scrollbar bg-black/40 backdrop-blur-md"
        >
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
              <Terminal size={48} className="opacity-20" />
              <p className="tracking-widest uppercase text-xs font-bold">Telemetry Buffer Empty</p>
            </div>
          ) : (
            <div className="max-w-none">
              {logs.map((log, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 hover:bg-white/5 py-1 px-2 rounded group transition-colors">
                  <div className="flex gap-3 shrink-0">
                    <span className="text-white/40 min-w-[170px] select-none text-[11px] sm:text-[13px] flex items-center">
                      {log.timestamp}
                    </span>
                    <span className={`w-[60px] font-bold uppercase tracking-wider text-[11px] sm:text-[13px] flex items-center ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </div>
                  <span className="text-cyan-50/80 group-hover:text-white break-all sm:break-normal transition-colors flex-1">
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Scroll to bottom button when auto-scroll is disabled */}
        {!shouldAutoScroll && logs.length > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 p-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-full backdrop-blur-md transition-all z-20 group animate-pulse hover:animate-none"
            title="Resume Live Stream"
          >
            <ArrowDownToLine size={20} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Logs

