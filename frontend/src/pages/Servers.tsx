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

  const downloadCA = async () => {
    try {
      const response = await api.get('/panel/ca/server?download=true', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'ca-server.crt')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download CA:', error)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-400 relative z-10"></div>
          </div>
          <p className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold glow-cyan/50">Loading servers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-xl"></div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase gradient-text drop-shadow-sm mb-1">{t.servers.title}</h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">{t.servers.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={showCA}
            className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all text-gray-300 hover:text-white flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Copy size={18} className="relative z-10" />
            <span className="relative z-10">{t.servers.viewCACertificate}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-bold bg-white text-black hover:scale-[0.98] transition-all flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">{t.dashboard.addServer}</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-wider font-bold text-gray-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Fingerprint</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Last Seen</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {servers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50 mb-2" />
                      <p className="tracking-wide uppercase text-sm">No foreign servers found.</p>
                      <p className="text-xs opacity-70">Add a server to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                servers.map((server) => (
                  <tr key={server.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white tracking-wide">{server.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md font-mono border border-cyan-400/20">{server.fingerprint}</code>
                        <button
                          onClick={() => copyToClipboard(server.fingerprint)}
                          className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const connStatus = server.metadata?.connection_status || 'failed'
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'connected': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald/20'
                            case 'connecting':
                            case 'reconnecting': return 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber/20'
                            case 'failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          }
                        }
                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'connected': return <CheckCircle size={12} className="text-emerald-400" />
                            case 'connecting':
                            case 'reconnecting': return <AlertCircle size={12} className="text-amber-400" />
                            case 'failed': return <XCircle size={12} className="text-rose-400" />
                            default: return <XCircle size={12} className="text-gray-400" />
                          }
                        }
                        const getStatusText = (status: string) => {
                          switch (status) {
                            case 'connected': return 'Connected'
                            case 'connecting': return 'Connecting'
                            case 'reconnecting': return 'Reconnecting'
                            case 'failed': return 'Failed'
                            default: return status
                          }
                        }
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(connStatus)}`}>
                            {getStatusIcon(connStatus)}
                            {getStatusText(connStatus)}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                      {server.metadata?.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(server.last_seen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteServer(server.id)}
                        className="p-2 text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Server"
                      >
                        <Trash2 size={16} />
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl border border-white/10 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>

        <div className="p-6">
          <h2 className="text-xl font-black text-white tracking-wide uppercase mb-6 flex items-center gap-2">
            <Globe className="text-cyan-400" size={24} />
            Add Foreign Server
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium font-mono"
                placeholder="e.g., 192.168.1.100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                API Port
              </label>
              <input
                type="number"
                value={apiPort}
                onChange={(e) => setApiPort(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium font-mono"
                placeholder="8888"
                min="1"
                max="65535"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider text-sm hover:bg-cyan-500 hover:text-white transition-all border border-cyan-500/30 hover:border-cyan-400"
              >
                {t.dashboard.addServer}
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>

        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
            <Activity className="text-emerald-400" size={24} />
            Foreign CA Certificate
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <p className="text-sm text-blue-300 leading-relaxed font-medium pl-2">
              <strong className="text-blue-400">Foreign Server Installation:</strong> Copy the certificate below.
              During foreign server installation, you will be prompted to paste this certificate.
            </p>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-emerald-400 relative z-10"></div>
              </div>
              <div className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Loading certificate...</div>
            </div>
          ) : (
            <>
              <textarea
                readOnly
                value={certContent}
                className="w-full px-5 py-4 border border-white/10 rounded-xl font-mono text-sm bg-black/60 text-emerald-400 resize-none focus:outline-none focus:border-emerald-500/50 custom-scrollbar shadow-inner"
                style={{ minHeight: '300px' }}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 font-bold uppercase tracking-wider text-xs hover:bg-white/10 transition-colors border border-white/5"
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
                      const textarea = e.currentTarget.closest('.bg-white, .dark\\:bg-gray-800')?.querySelector('textarea')
                      if (textarea) {
                        textarea.select()
                        textarea.setSelectionRange(0, 99999)
                        try {
                          document.execCommand('copy')
                          onCopy()
                        } catch (err) {
                          alert('Failed to copy to clipboard. Please select and copy manually from the text area above.')
                        }
                      } else {
                        alert('Failed to copy to clipboard. Please select and copy manually from the text area above.')
                      }
                    }
                  }}
                  disabled={loading || !certContent || certContent.trim().length === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${copied
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy Certificate'}
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
