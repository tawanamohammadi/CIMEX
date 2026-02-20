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
        <ActivityIcon className="text-primary w-8 h-8 animate-pulse" />
        <p className="text-muted-foreground text-sm font-medium">Loading System Data...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {t.dashboard.title || "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.dashboard.subtitle || "Monitor core infrastructure and active relays."}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20 text-sm font-medium">
          <ShieldCheck size={16} />
          System Secure
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.totalNodes || "Active Nodes"}
          value={String(status.nodes.total).padStart(2, '0')}
          subtitle={`${status.nodes.active} ${t.dashboard.active || "Active"}`}
          icon={Server}
        />
        <StatCard
          title={t.dashboard.totalTunnels || "Total Tunnels"}
          value={String(status.tunnels.total).padStart(2, '0')}
          subtitle={`${status.tunnels.active} ${t.dashboard.active || "Active"}`}
          icon={Network}
        />
        <StatCard
          title={t.dashboard.cpuUsage || "CPU Usage"}
          value={`${status.system.cpu_percent.toFixed(1)}%`}
          subtitle={t.dashboard.currentUsage || "Current load"}
          icon={Cpu}
          progress={status.system.cpu_percent}
        />
        <StatCard
          title={t.dashboard.memoryUsage || "Memory Usage"}
          value={`${status.system.memory_used_gb.toFixed(1)}GB`}
          subtitle={`${status.system.memory_percent.toFixed(1)}% / ${status.system.memory_total_gb.toFixed(1)}GB`}
          icon={MemoryStick}
          progress={status.system.memory_percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Real-time Diagnostics */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ActivityIcon className="text-primary w-5 h-5" />
              {t.dashboard.systemResources || "Hardware Diagnostics"}
            </h2>
            <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">Live</span>
          </div>

          <div className="space-y-6">
            <DiagnosticsBar
              label="CPU Compute"
              value={status.system.cpu_percent}
            />
            <DiagnosticsBar
              label="Memory Usage"
              value={status.system.memory_percent}
            />
          </div>
        </div>

        {/* Quick Launch */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Globe className="text-primary w-5 h-5" />
            {t.dashboard.quickActions || "Quick Actions"}
          </h2>

          <div className="flex flex-col gap-3 flex-1">
            <button
              onClick={() => window.location.href = '/tunnels?create=true'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
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
      className="w-full flex items-center justify-between px-4 py-2.5 bg-accent/50 hover:bg-accent text-accent-foreground rounded-md font-medium transition-colors border border-transparent hover:border-border"
    >
      <span>{label}</span>
      <Plus size={16} className="text-muted-foreground" />
    </button>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  progress?: number
}

const StatCard = ({ title, value, subtitle, icon: Icon, progress }: StatCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="text-2xl font-bold mb-1">{value}</div>

      {progress !== undefined ? (
        <div className="mt-4">
          <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}

interface DiagnosticsBarProps {
  label: string
  value: number
}

const DiagnosticsBar = ({ label, value }: DiagnosticsBarProps) => {
  const percentage = Math.min(value, 100)
  const isHigh = percentage > 85

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${isHigh ? 'text-destructive' : 'text-primary'}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default Dashboard
