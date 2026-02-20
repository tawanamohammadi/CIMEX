import { useEffect, useState } from 'react'
import { Plus, Copy, Trash2, CheckCircle, XCircle, AlertCircle, Globe, Activity } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

interface Server {
  id: string
  name: string
  fingerprint: string
  status: string
  registered_at: string
  last_seen: string
  metadata: Record<string, any>
}

const Servers = () => {
  const { t } = useLanguage()
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [certContent, setCertContent] = useState('')
  const [certLoading, setCertLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchServers()
    const params = new URLSearchParams(window.location.search)
    if (params.get('add') === 'true') {
      setShowAddModal(true)
      window.history.replaceState({}, '', '/servers')
    }
  }, [])

  const fetchServers = async () => {
    try {
      const response = await api.get('/nodes')
      // Filter only foreign servers
      const foreignServers = response.data.filter((node: Server) =>
        node.metadata?.role === 'foreign'
      )
      setServers(foreignServers)
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard. Please copy manually.')
    }
  }

  const showCA = async () => {
    setShowCertModal(true)
    setCertLoading(true)
    try {
      const response = await api.get('/panel/ca/server', {
        responseType: 'text',
        headers: {
          'Accept': 'text/plain'
        }
      })
      const text = response.data
      if (!text || text.trim().length === 0) {
        throw new Error('Certificate is empty. Make sure the panel has generated it.')
      }
      setCertContent(text)
    } catch (error: any) {
      console.error('Failed to fetch CA:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch CA certificate'
      alert(`Failed to fetch CA certificate: ${errorMessage}`)
      setShowCertModal(false)
    } finally {
      setCertLoading(false)
    }
  }

  const deleteServer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return

    try {
      await api.delete(`/nodes/${id}`)
      fetchServers()
    } catch (error) {
      console.error('Failed to delete server:', error)
      alert('Failed to delete server')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="text-purple-400 w-12 h-12 animate-pulse drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        <p className="text-white/60 text-sm font-bold tracking-widest uppercase">Connecting to Gateway...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">{t.servers.title}</h1>
          <p className="text-white/60 text-sm">{t.servers.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={showCA}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-white/5"
          >
            <Copy size={16} className="text-purple-400" />
            <span>{t.servers.viewCACertificate}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-50 font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <Plus size={16} className="text-purple-400" />
            <span>{t.dashboard.addServer}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 border-b border-white/10 text-white/50 font-bold tracking-wider uppercase text-xs">
              <tr>
                <th className="px-6 py-5">Server Designation</th>
                <th className="px-6 py-5">Fingerprint</th>
                <th className="px-6 py-5">Network Status</th>
                <th className="px-6 py-5">IP Address</th>
                <th className="px-6 py-5">Last Synced</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {servers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-white/40 font-medium bg-black/20">
                    <div className="flex flex-col items-center gap-3">
                      <Globe className="w-8 h-8 opacity-50 text-purple-400" />
                      <p className="text-base tracking-widest uppercase">No foreign gateways found.</p>
                      <p className="text-xs opacity-60">Provision a server to bridge networks.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                servers.map((server) => (
                  <tr key={server.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Globe size={16} />
                      </div>
                      {server.name}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs">
                        <code className="bg-black/50 px-2.5 py-1.5 rounded-lg border border-white/10 text-purple-200 font-mono tracking-wider">{server.fingerprint}</code>
                        <button
                          onClick={() => copyToClipboard(server.fingerprint)}
                          className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const connStatus = server.metadata?.connection_status || 'failed'
                        const getStatusClasses = (status: string) => {
                          switch (status) {
                            case 'connected': return 'bg-green-500/10 text-green-400 border-green-500/30 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]'
                            case 'connecting':
                            case 'reconnecting': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30'
                            default: return 'bg-white/5 text-white/50 border-white/10'
                          }
                        }
                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'connected': return <CheckCircle size={14} />
                            case 'connecting':
                            case 'reconnecting': return <AlertCircle size={14} className="animate-pulse" />
                            case 'failed': return <XCircle size={14} />
                            default: return <XCircle size={14} />
                          }
                        }
                        return (
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border ${getStatusClasses(connStatus)}`}>
                            {getStatusIcon(connStatus)}
                            {connStatus}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-5 font-mono text-white/80 text-sm">
                      {server.metadata?.ip_address || 'Unassigned'}
                    </td>
                    <td className="px-6 py-5 text-white/60 text-xs font-mono">
                      {new Date(server.last_seen).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => deleteServer(server.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/30"
                        title="Dismantle Server"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddServerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchServers()
          }}
        />
      )}

      {showCertModal && (
        <CertModal
          certContent={certContent}
          loading={certLoading}
          onClose={() => setShowCertModal(false)}
          onCopy={() => setCopied(true)}
          copied={copied}
        />
      )}
    </div>
  )
}

interface AddServerModalProps {
  onClose: () => void
  onSuccess: () => void
}

const AddServerModal = ({ onClose, onSuccess }: AddServerModalProps) => {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [apiPort, setApiPort] = useState('8888')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/nodes', {
        name,
        ip_address: ipAddress,
        api_port: parseInt(apiPort) || 8888,
        metadata: {
          role: 'foreign'
        }
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to add server:', error)
      alert('Failed to add server')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animation-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

        <div className="p-8">
          <h2 className="text-xl font-black flex items-center gap-3 mb-8 text-white tracking-wide">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Globe size={22} />
            </div>
            Deploy Foreign Server
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                Server Identity
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-white/20 font-medium transition-all"
                placeholder="e.g. Frankfurt-Core"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-purple-100 placeholder-white/20 transition-all"
                placeholder="0.0.0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                API Port
              </label>
              <input
                type="number"
                value={apiPort}
                onChange={(e) => setApiPort(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-purple-100 placeholder-white/20 transition-all"
                placeholder="8888"
                min="1"
                max="65535"
                required
              />
            </div>

            <div className="flex gap-3 pt-6 mt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-widest uppercase transition-colors border border-white/5"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-50 font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/50"
              >
                Launch Server
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface CertModalProps {
  certContent: string
  loading: boolean
  onClose: () => void
  onCopy: () => void
  copied: boolean
}

const CertModal = ({ certContent, loading, onClose, onCopy, copied }: CertModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animation-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-black flex items-center gap-3 text-white tracking-wide">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Activity size={20} />
            </div>
            Foreign CA Certificate
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <XCircle size={22} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto custom-scrollbar">
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-200/80 leading-relaxed font-bold">
            <span className="text-purple-400 uppercase tracking-widest text-xs block mb-1">Protocol Instruction:</span>
            Copy the certificate payload below. During foreign server installation, you will be required to transmit this secure payload.
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-white/50">
              <Activity className="w-10 h-10 animate-pulse text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <div className="text-xs font-bold uppercase tracking-widest">Decrypting Payload...</div>
            </div>
          ) : (
            <>
              <textarea
                readOnly
                value={certContent}
                className="w-full h-72 p-5 border border-white/10 rounded-xl font-mono text-[13px] bg-black/60 text-purple-200/70 focus:outline-none focus:ring-1 focus:ring-purple-500/50 shadow-inner custom-scrollbar"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors border border-transparent hover:border-white/10"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    try {
                      if (certContent && certContent.trim().length > 0) {
                        await navigator.clipboard.writeText(certContent)
                        onCopy()
                      } else {
                        alert('Certificate content is empty. Please wait for it to load.')
                      }
                    } catch (error) {
                      console.error('Failed to copy:', error)
                      const textarea = e.currentTarget.closest('.glass-panel')?.querySelector('textarea')
                      if (textarea) {
                        textarea.select()
                        textarea.setSelectionRange(0, 99999)
                        try {
                          document.execCommand('copy')
                          onCopy()
                        } catch (err) {
                          alert('Failed to copy to clipboard. Please copy manually.')
                        }
                      }
                    }
                  }}
                  disabled={loading || !certContent || certContent.trim().length === 0}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${copied
                    ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50'
                    }`}
                >
                  <Copy size={16} />
                  {copied ? 'Payload Secured' : 'Copy Payload'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Servers
