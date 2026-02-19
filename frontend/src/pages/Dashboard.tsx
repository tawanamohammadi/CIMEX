import { useEffect, useState } from 'react'
import { Server, Network, Cpu, MemoryStick, Plus, Activity as ActivityIcon, Globe, Zap, ArrowRight, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../api/client'

interface Status {
  system: {
    cpu_percent: number
    memory_percent: number
    memory_total_gb: number
    memory_used_gb: number
  }
  tunnels: {
    total: number
    active: number
  }
  nodes: {
    total: number
    active: number
  }
}

const Dashboard = () => {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await api.get('/status')
        setStatus(statusResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-6 pulse-glow">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 border-glow-animate animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <ActivityIcon className="absolute inset-0 m-auto text-cyan-400 w-8 h-8 opacity-80" />
        </div>
        <p className="text-lg text-cyan-500 font-mono tracking-widest uppercase glow-cyan/20">Init System...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8" dir="ltr">
      {/* Dynamic Header */}
      <div className="relative glass-strong rounded-2xl p-8 overflow-hidden border-glow-animate mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
          <Globe className="w-64 h-64 text-cyan-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {t.dashboard.title || "TELEMETRY ACTIVE"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 uppercase drop-shadow-lg">
              <span className="gradient-text">CIMEX</span> COMMAND
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              {t.dashboard.subtitle || "Monitor core infrastructure, active relays, and payload transmission metrics."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-400 mb-1">NETWORK STATUS</span>
              <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                <ShieldCheck size={18} />
                SECURE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orbiting Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.dashboard.totalNodes}
          value={String(status.nodes.total).padStart(2, '0')}
          subtitle={`${status.nodes.active} ${t.dashboard.active}`}
          icon={Server}
          color="cyan"
          trend="up"
        />
        <StatCard
          title={t.dashboard.totalTunnels}
          value={String(status.tunnels.total).padStart(2, '0')}
          subtitle={`${status.tunnels.active} ${t.dashboard.active}`}
          icon={Network}
          color="purple"
          trend="up"
        />
        <StatCard
          title={t.dashboard.cpuUsage}
          value={`${status.system.cpu_percent.toFixed(1)}%`}
          subtitle={t.dashboard.currentUsage}
          icon={Cpu}
          color="pink"
          progress={status.system.cpu_percent}
        />
        <StatCard
          title={t.dashboard.memoryUsage}
          value={`${status.system.memory_used_gb.toFixed(1)}GB`}
          subtitle={`${status.system.memory_percent.toFixed(1)}% / ${status.system.memory_total_gb.toFixed(1)}GB`}
          icon={MemoryStick}
          color="orange"
          progress={status.system.memory_percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Real-time Diagnostics */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <ActivityIcon className="text-cyan-400" />
              {t.dashboard.systemResources || "HARDWARE DIAGNOSTICS"}
            </h2>
            <div className="px-3 py-1 bg-gray-800/50 rounded-md border border-gray-700 text-xs font-mono text-gray-400">
              UPDATE: 5s
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <DiagnosticsBar
              label="CORE COMPUTE (CPU)"
              value={status.system.cpu_percent}
              color="cyan"
            />
            <DiagnosticsBar
              label="RANDOM ACCESS (MEM)"
              value={status.system.memory_percent}
              color="purple"
            />
          </div>
        </div>

        {/* Quick Launch */}
        <div className="glass rounded-2xl p-6 relative flex flex-col group">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-pink-500/10 to-transparent pointer-events-none rounded-b-2xl"></div>

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Zap className="text-pink-400" />
            {t.dashboard.quickActions || "RAPID DEPLOY"}
          </h2>

          <div className="flex-1 flex flex-col gap-4">
            <button
              onClick={() => window.location.href = '/tunnels?create=true'}
              className="relative w-full overflow-hidden p-[1px] rounded-xl group/btn"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
              <div className="relative flex items-center justify-between px-5 py-4 bg-gray-900 rounded-xl hover:bg-gray-900/80 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg text-white">
                    <Plus size={18} />
                  </div>
                  <span className="font-bold text-white">{t.dashboard.createNewTunnel || "ESTABLISH TUNNEL"}</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all" />
              </div>
            </button>

            <ActionContainer onClick={() => window.location.href = '/nodes?add=true'} label={t.dashboard.addNode || "DEPLOY NODE"} />
            <ActionContainer onClick={() => window.location.href = '/servers?add=true'} label={t.dashboard.addServer || "REGISTER SEVER"} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionContainer({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 glass border border-gray-700/50 hover:border-gray-500/80 rounded-xl hover:bg-white/5 transition-all duration-300 group/btn"
    >
      <span className="font-medium text-gray-300 group-hover/btn:text-white transition-colors">{label}</span>
      <ArrowRight size={18} className="text-gray-500 group-hover/btn:text-cyan-400 transform group-hover/btn:translate-x-1 transition-all" />
    </button>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  color: 'cyan' | 'purple' | 'pink' | 'orange'
  trend?: 'up' | 'down'
  progress?: number
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, progress }: StatCardProps) => {
  const colorSchemes = {
    cyan: 'from-cyan-500 to-blue-600 text-cyan-400 glow-cyan',
    purple: 'from-purple-500 to-indigo-600 text-purple-400 glow-purple',
    pink: 'from-pink-500 to-rose-600 text-pink-400 glow-pink',
    orange: 'from-orange-500 to-amber-600 text-orange-400',
  }

  const gradient = colorSchemes[color].split('text-')[0].trim()
  const textColor = `text-${colorSchemes[color].split('text-')[1].split(' ')[0]}`

  return (
    <div className="glass rounded-xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-gray-700/50 hover:border-gray-500/80">
      {/* Background Glow */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-colors duration-500`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
          <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Icon className={`w-5 h-5 ${textColor}`} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">{value}</p>
        </div>

        {progress !== undefined ? (
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono mt-2">{subtitle}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface DiagnosticsBarProps {
  label: string
  value: number
  color: 'cyan' | 'purple' | 'pink'
}

const DiagnosticsBar = ({ label, value, color }: DiagnosticsBarProps) => {
  const percentage = Math.min(value, 100)
  const isHigh = percentage > 85

  const gradients = {
    cyan: 'from-cyan-500 to-blue-500 glow-cyan',
    purple: 'from-purple-500 to-indigo-500 glow-purple',
    pink: 'from-pink-500 to-rose-500 glow-pink',
  }

  const usageGradient = isHigh ? 'from-red-500 to-orange-500' : gradients[color]

  return (
    <div className="group/bar">
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-gray-300 tracking-wider text-sm">{label}</span>
        <span className={`font-mono text-lg font-bold ${isHigh ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="relative w-full bg-gray-900 border border-gray-800 rounded-full h-4 overflow-hidden shadow-inner p-0.5">
        {/* Dynamic scanning backgound */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDIwTDIwIDAgSCAyMExgMjAgWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-30 z-10 mix-blend-overlay pointer-events-none"></div>
        <div
          className={`relative h-full rounded-full bg-gradient-to-r ${usageGradient} transition-all duration-1000 ease-out z-0`}
          style={{ width: `${percentage}%` }}
        >
          {/* Highlight effect on progress bar */}
          <div className="absolute top-0 right-0 w-8 h-full bg-white/30 blur-sm rounded-full mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

