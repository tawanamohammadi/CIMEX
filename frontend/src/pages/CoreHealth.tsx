import { useState, useEffect } from 'react'
import { Activity, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle, Settings } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

interface CoreHealth {
  core: string
  nodes_status: Record<string, {
    id: string
    name: string
    role: string
    status: string
    error_message?: string | null
  }>
  servers_status: Record<string, {
    id: string
    name: string
    role: string
    status: string
    error_message?: string | null
  }>
}

interface ResetConfig {
  core: string
  enabled: boolean
  interval_minutes: number
  last_reset: string | null
  next_reset: string | null
}

const CoreHealth = () => {
  const { t } = useLanguage()
  const [health, setHealth] = useState<CoreHealth[]>([])
  const [configs, setConfigs] = useState<ResetConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [healthRes, configsRes] = await Promise.all([
        api.get('/core-health/health'),
        api.get('/core-health/reset-config')
      ])
      setHealth(healthRes.data)
      setConfigs(configsRes.data)
    } catch (error) {
      console.error('Failed to fetch core health:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])


  const handleReset = async (core: string) => {
    if (!confirm(`Are you sure you want to re-initialize the ${core} subsystem?`)) return

    setUpdating(core)
    try {
      await api.post(`/core-health/reset/${core}`)
      await fetchData()
    } catch (error) {
      console.error(`Failed to reset ${core}:`, error)
      alert(`Failed to reset ${core}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleConfigUpdate = async (core: string, updates: Partial<ResetConfig>) => {
    setUpdating(core)
    try {
      await api.put(`/core-health/reset-config/${core}`, updates)
      await fetchData()
    } catch (error) {
      console.error(`Failed to update config for ${core}:`, error)
      alert(`Failed to update config`)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-400 font-bold"
      case "connecting":
      case "reconnecting":
        return "text-yellow-400 font-medium"
      case "failed":
        return "text-red-400 font-bold"
      default:
        return "text-white/40"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
      case "connecting":
      case "reconnecting":
        return "bg-yellow-500/10 text-yellow-400"
      case "failed":
        return "bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]"
      default:
        return "bg-white/5 text-white/50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case "connecting":
      case "reconnecting":
        return <AlertCircle className="w-4 h-4 text-yellow-400 animate-pulse" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-white/40" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Operational"
      case "connecting":
        return "Establishing Link"
      case "reconnecting":
        return "Restoring Array"
      case "failed":
        return "Critical Failure"
      default:
        return "Unknown Status"
    }
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="text-cyan-400 w-12 h-12 animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
        <p className="text-white/60 text-sm font-bold tracking-widest uppercase">{t.common.loading || "Diagnosing Diagnostics..."}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 pt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] tracking-tight">Core Diagnostics</h1>
        <p className="text-white/60 font-medium text-sm">Real-time health telemetry across all deployed subsystems.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {health.map((coreHealth) => {
          const config = configs.find(c => c.core === coreHealth.core)
          const nodeCount = Object.keys(coreHealth.nodes_status).length
          const serverCount = Object.keys(coreHealth.servers_status).length

          return (
            <div
              key={coreHealth.core}
              className="glass-panel overflow-hidden rounded-2xl relative border border-white/10 flex flex-col transition-all hover:bg-white/5"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

              <div className="p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">
                      {coreHealth.core}
                    </h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">
                      {nodeCount} Modules <span className="mx-1 opacity-40">•</span> {serverCount} Gateways
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> Module Telemetry
                  </h3>
                  <div className="space-y-2">
                    {nodeCount === 0 ? (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                        <span className="text-xs text-white/30 font-bold uppercase tracking-widest">No Active Modules</span>
                      </div>
                    ) : (
                      Object.entries(coreHealth.nodes_status).map(([nodeId, nodeInfo]) => (
                        <div key={nodeId} className="flex flex-col p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-white/80 text-sm font-medium truncate">
                              {nodeInfo.name || nodeId.substring(0, 8)}...
                            </span>
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border border-transparent text-xs ${getStatusBgColor(nodeInfo.status)}`}>
                              {getStatusIcon(nodeInfo.status)}
                              <span className="font-bold uppercase tracking-wider text-[10px]">
                                {getStatusText(nodeInfo.status)}
                              </span>
                            </div>
                          </div>
                          {nodeInfo.error_message && (
                            <div className="mt-2 text-[10px] font-mono p-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
                              {nodeInfo.error_message}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Gateway Telemetry
                  </h3>
                  <div className="space-y-2">
                    {serverCount === 0 ? (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                        <span className="text-xs text-white/30 font-bold uppercase tracking-widest">No Active Gateways</span>
                      </div>
                    ) : (
                      Object.entries(coreHealth.servers_status).map(([serverId, serverInfo]) => (
                        <div key={serverId} className="flex flex-col p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-white/80 text-sm font-medium truncate">
                              {serverInfo.name || serverId.substring(0, 8)}...
                            </span>
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border border-transparent text-xs ${getStatusBgColor(serverInfo.status)}`}>
                              {getStatusIcon(serverInfo.status)}
                              <span className="font-bold uppercase tracking-wider text-[10px]">
                                {getStatusText(serverInfo.status)}
                              </span>
                            </div>
                          </div>
                          {serverInfo.error_message && (
                            <div className="mt-2 text-[10px] font-mono p-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
                              {serverInfo.error_message}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/30 mt-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-white/40" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
                        Autonomous Re-init
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config?.enabled || false}
                        onChange={(e) => handleConfigUpdate(coreHealth.core, { enabled: e.target.checked })}
                        disabled={updating === coreHealth.core}
                        className="sr-only peer"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer shadow-inner border border-white/10 ${config?.enabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] border-cyan-400' : 'bg-white/10'}`}>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config?.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </div>
                    </label>
                  </div>

                  {config?.enabled && (
                    <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                        Interval Cycle (Min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={config.interval_minutes}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value)
                          if (minutes >= 1) {
                            handleConfigUpdate(coreHealth.core, { interval_minutes: minutes })
                          }
                        }}
                        disabled={updating === coreHealth.core}
                        className="w-16 px-2 py-1.5 text-center text-sm font-mono border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => handleReset(coreHealth.core)}
                      disabled={updating === coreHealth.core}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === coreHealth.core ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/80 border-t-white rounded-full animate-spin"></div>
                          <span>Executing Drop...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Force Manual Re-init</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CoreHealth
