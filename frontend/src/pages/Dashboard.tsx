import { useEffect, useState } from 'react'
import { Server, Network, Cpu, MemoryStick, Plus, Activity as ActivityIcon, Globe, ShieldCheck } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ActivityIcon className="text-cyan-400 w-10 h-10 animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
        <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase">Loading System Core...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            {t.dashboard.title || "Dashboard"}
          </h1>
          <p className="text-white/60 text-sm tracking-wide">
            {t.dashboard.subtitle || "Monitor core infrastructure and active relays."}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 text-sm font-bold shadow-[0_0_15px_rgba(0,255,128,0.15)] backdrop-blur-md">
          <ShieldCheck size={18} />
          System Secure
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t.dashboard.totalNodes || "Active Nodes"}
          value={String(status.nodes.total).padStart(2, '0')}
          subtitle={`${status.nodes.active} ${t.dashboard.active || "Active"}`}
          icon={Server}
          colorClass="text-cyan-400"
          glowClass="shadow-[0_0_20px_rgba(0,255,255,0.15)]"
        />
        <StatCard
          title={t.dashboard.totalTunnels || "Total Tunnels"}
          value={String(status.tunnels.total).padStart(2, '0')}
          subtitle={`${status.tunnels.active} ${t.dashboard.active || "Active"}`}
          icon={Network}
          colorClass="text-purple-400"
          glowClass="shadow-[0_0_20px_rgba(138,43,226,0.15)]"
        />
        <StatCard
          title={t.dashboard.cpuUsage || "CPU Usage"}
          value={`${status.system.cpu_percent.toFixed(1)}%`}
          subtitle={t.dashboard.currentUsage || "Current load"}
          icon={Cpu}
          progress={status.system.cpu_percent}
          colorClass="text-pink-400"
          glowClass="shadow-[0_0_20px_rgba(255,0,127,0.15)]"
        />
        <StatCard
          title={t.dashboard.memoryUsage || "Memory Usage"}
          value={`${status.system.memory_used_gb.toFixed(1)}GB`}
          subtitle={`${status.system.memory_percent.toFixed(1)}% / ${status.system.memory_total_gb.toFixed(1)}GB`}
          icon={MemoryStick}
          progress={status.system.memory_percent}
          colorClass="text-blue-400"
          glowClass="shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Real-time Diagnostics */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-colors duration-1000 -z-10" />

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                <ActivityIcon size={20} />
              </div>
              {t.dashboard.systemResources || "Hardware Diagnostics"}
            </h2>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.2)] animate-pulse">Live</span>
          </div>

          <div className="space-y-8 relative z-10">
            <DiagnosticsBar
              label="CPU Compute"
              value={status.system.cpu_percent}
              color="bg-gradient-to-r from-pink-500 to-rose-400"
              shadow="shadow-[0_0_10px_rgba(255,0,127,0.5)]"
            />
            <DiagnosticsBar
              label="Memory Usage"
              value={status.system.memory_percent}
              color="bg-gradient-to-r from-cyan-400 to-blue-500"
              shadow="shadow-[0_0_10px_rgba(0,255,255,0.5)]"
            />
          </div>
        </div>

        {/* Quick Launch */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] -z-10" />

          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Globe size={20} />
            </div>
            {t.dashboard.quickActions || "Quick Actions"}
          </h2>

          <div className="flex flex-col gap-4 flex-1">
            <button
              onClick={() => window.location.href = '/tunnels?create=true'}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] glow-cyan-text"
            >
              <Plus size={18} />
              {t.dashboard.createNewTunnel || "Establish Tunnel"}
            </button>
            <ActionContainer onClick={() => window.location.href = '/nodes?add=true'} label={t.dashboard.addNode || "Deploy Node"} />
            <ActionContainer onClick={() => window.location.href = '/servers?add=true'} label={t.dashboard.addServer || "Register Server"} />
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
      className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-semibold transition-all border border-white/5 hover:border-white/20 group"
    >
      <span>{label}</span>
      <div className="p-1 bg-white/0 group-hover:bg-white/10 rounded-md transition-colors">
        <Plus size={16} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
      </div>
    </button>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, progress, colorClass = "text-primary", glowClass = "" }: { title: string, value: string, subtitle: string, icon: LucideIcon, progress?: number, colorClass?: string, glowClass?: string }) {
  return (
    <div className={`glass-panel border-white/10 rounded-2xl p-5 flex flex-col hover:border-white/20 transition-all duration-300 ${glowClass} group`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white/60 text-sm font-semibold truncate tracking-wider">
          {title}
        </h3>
        <div className={`p-2.5 bg-white/5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight mb-1 font-mono">
          {value}
        </p>
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">
          {subtitle}
        </p>
      </div>
      {progress !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${colorClass.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function DiagnosticsBar({ label, value, color = "bg-primary", shadow = "" }: { label: string, value: number, color?: string, shadow?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2 font-bold">
        <span className="text-white/80">{label}</span>
        <span className="text-white font-mono">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5">
        <div
          className={`h-full ${color} ${shadow}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

export default Dashboard
