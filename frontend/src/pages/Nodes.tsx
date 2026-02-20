import { useEffect, useState } from 'react'
import { Plus, Copy, Trash2, CheckCircle, XCircle, Download, AlertCircle, Network } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

interface Node {
  id: string
  name: string
  fingerprint: string
  status: string
  registered_at: string
  last_seen: string
  metadata: Record<string, any>
}

const Nodes = () => {
  const { t } = useLanguage()
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [certContent, setCertContent] = useState<string>('')
  const [certLoading, setCertLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchNodes()
    const params = new URLSearchParams(window.location.search)
    if (params.get('add') === 'true') {
      setShowAddModal(true)
      window.history.replaceState({}, '', '/nodes')
    }
  }, [])

  const fetchNodes = async () => {
    try {
      const response = await api.get('/nodes')
      // Filter only iran nodes (exclude foreign servers)
      const iranNodes = response.data.filter((node: Node) =>
        node.metadata?.role !== 'foreign' && (node.metadata?.role === 'iran' || !node.metadata?.role)
      )
      setNodes(iranNodes)
    } catch (error) {
      console.error('Failed to fetch nodes:', error)
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
      const response = await api.get('/panel/ca', {
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
      const response = await api.get('/panel/ca?download=true', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'ca.crt')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download CA:', error)
    }
  }

  const deleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this node?')) return

    try {
      await api.delete(`/nodes/${id}`)
      fetchNodes()
    } catch (error) {
      console.error('Failed to delete node:', error)
      alert('Failed to delete node')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Network className="text-primary w-8 h-8 animate-pulse" />
        <p className="text-muted-foreground text-sm font-medium">Loading Nodes...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t.nodes.title}</h1>
          <p className="text-muted-foreground text-sm">{t.nodes.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showCA}
            className="flex items-center gap-2 px-4 py-2 bg-accent/50 hover:bg-accent text-accent-foreground font-medium rounded-md transition-colors text-sm"
          >
            <Copy size={16} />
            <span>{t.nodes.viewCACertificate}</span>
          </button>

          <button
            onClick={downloadCA}
            className="flex items-center gap-2 px-4 py-2 bg-accent/50 hover:bg-accent text-accent-foreground font-medium rounded-md transition-colors text-sm"
          >
            <Download size={16} />
            <span>{t.nodes.downloadCA}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-colors text-sm"
          >
            <Plus size={16} />
            <span>{t.nodes.addNode}</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Fingerprint</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Last Seen</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 mb-1 opacity-50" />
                      <p>No internal nodes found.</p>
                      <p className="text-xs opacity-75">Add a node to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-semibold">
                      {node.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <code className="bg-muted px-2 py-1 rounded border border-border text-primary">{node.fingerprint}</code>
                        <button
                          onClick={() => copyToClipboard(node.fingerprint)}
                          className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const connStatus = node.metadata?.connection_status || 'failed'
                        const getStatusClasses = (status: string) => {
                          switch (status) {
                            case 'connected': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                            case 'connecting':
                            case 'reconnecting': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                            case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            default: return 'bg-muted text-muted-foreground border-border'
                          }
                        }
                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'connected': return <CheckCircle size={14} />
                            case 'connecting':
                            case 'reconnecting': return <AlertCircle size={14} />
                            case 'failed': return <XCircle size={14} />
                            default: return <XCircle size={14} />
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusClasses(connStatus)}`}>
                            {getStatusIcon(connStatus)}
                            {getStatusText(connStatus)}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {node.metadata?.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(node.last_seen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Node"
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
        <AddNodeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchNodes()
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

interface AddNodeModalProps {
  onClose: () => void
  onSuccess: () => void
}

const AddNodeModal = ({ onClose, onSuccess }: AddNodeModalProps) => {
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
          role: 'iran'
        }
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to add node:', error)
      alert('Failed to add node')
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg flex flex-col overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Network className="text-primary" size={20} />
            {t.nodes.addNode}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Node Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="e.g., 192.168.1.100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                API Port
              </label>
              <input
                type="number"
                value={apiPort}
                onChange={(e) => setApiPort(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="8888"
                min="1"
                max="65535"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                {t.nodes.addNode}
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-xl max-h-[90vh] rounded-xl border border-border shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Network className="text-primary w-5 h-5" />
            Internal Node CA Certificate
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <div className="mb-4 p-3 bg-muted border border-border rounded-md text-sm text-muted-foreground">
            <strong>Node Installation:</strong> Copy the certificate below. During internal node installation, you will be prompted to paste this certificate.
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Network className="w-8 h-8 animate-pulse text-primary" />
              <div className="text-sm font-semibold uppercase tracking-widest">Loading certificate...</div>
            </div>
          ) : (
            <>
              <textarea
                readOnly
                value={certContent}
                className="w-full h-64 p-4 border border-border rounded-md font-mono text-[13px] bg-input focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md hover:bg-accent text-accent-foreground font-medium text-sm transition-colors border border-transparent hover:border-border"
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
                      const textarea = e.currentTarget.closest('.bg-card')?.querySelector('textarea')
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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${copied
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
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

export default Nodes
