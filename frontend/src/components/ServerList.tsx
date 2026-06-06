import { useEffect, useState, useCallback } from 'react'
import type { Server, ServerStatus } from '../types'
import { STATUS_LABELS } from '../types'
import { api } from '../services/api'
import ServerForm from './ServerForm'
import ServerHistory from './ServerHistory'

interface Props {
  refreshTrigger: number
  onRefresh: () => void
}

export default function ServerList({ refreshTrigger, onRefresh }: Props) {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [historyServerId, setHistoryServerId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getServers()
      setServers(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar servidores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServers()
  }, [fetchServers, refreshTrigger])

  const handleDelete = async (id: number | null) => {
    if (id === null) return
    if (!confirm('¿Estás seguro de eliminar este servidor?')) return
    setDeletingId(id)
    try {
      await api.deleteServer(id)
      setServers((prev) => prev.filter((s) => s.id !== id))
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar servidor')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (server: Server) => {
    setEditingServer(server)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingServer(null)
    fetchServers()
    onRefresh()
  }

  const statusConfig = (status: ServerStatus) => {
    switch (status) {
      case 'ONLINE':
        return {
          dot: 'bg-emerald-400',
          glow: 'status-online',
          ping: 'bg-emerald-400',
          label: STATUS_LABELS.ONLINE,
          borderGlow: 'border-emerald-500/20 hover:border-emerald-500/30',
          icon: '🟢',
        }
      case 'OFFLINE':
        return {
          dot: 'bg-rose-400',
          glow: 'status-offline',
          ping: 'bg-rose-400',
          label: STATUS_LABELS.OFFLINE,
          borderGlow: 'border-rose-500/20 hover:border-rose-500/30',
          icon: '🔴',
        }
      case 'UNKNOWN':
      default:
        return {
          dot: 'bg-gold-400',
          glow: 'status-unknown',
          ping: 'bg-gold-400',
          label: STATUS_LABELS.UNKNOWN,
          borderGlow: 'border-gold-500/20 hover:border-gold-500/30',
          icon: '🟡',
        }
    }
  }

  return (
    <div>
      {/* Header with action button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white/90">Servidores</h3>
          {!loading && servers.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/40">
              {servers.length}
            </span>
          )}
        </div>
        <button
          onClick={() => { setEditingServer(null); setShowForm(true) }}
          className="btn-glow btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo servidor
        </button>
      </div>

      {/* Modal: Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-overlay animate-fade-in-scale" onClick={handleFormClose}>
          <div className="glass-strong rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-4 animate-fade-in-up border border-white/10" onClick={(e) => e.stopPropagation()}>
            <ServerForm server={editingServer} onClose={handleFormClose} />
          </div>
        </div>
      )}

      {/* Modal: History */}
      {historyServerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-overlay animate-fade-in-scale" onClick={() => setHistoryServerId(null)}>
          <div className="glass-strong rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto animate-fade-in-up border border-white/10" onClick={(e) => e.stopPropagation()}>
            <ServerHistory serverId={historyServerId} onClose={() => setHistoryServerId(null)} />
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && servers.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded-full w-48 mb-2" />
                  <div className="h-3 bg-white/5 rounded-full w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-6 border border-rose-500/20">
          <div className="flex items-center gap-3 text-rose-400 text-sm">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        </div>
      ) : servers.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-dashed border-white/10">
          <div className="text-4xl mb-4">🖥️</div>
          <p className="text-white/50 text-lg font-medium mb-1">No hay servidores registrados</p>
          <p className="text-white/25 text-sm">Agrega tu primer servidor para comenzar a monitorear</p>
        </div>
      ) : (
        <div className="space-y-3">
          {servers.map((server, i) => {
            const cfg = statusConfig(server.status)
            return (
              <div
                key={server.id}
                className={`group relative glass rounded-2xl p-5 border ${cfg.borderGlow} transition-all duration-500 animate-fade-in-up hover:scale-[1.01] hover:bg-white/[0.07] cursor-default`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Left gradient accent */}
                <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${server.status === 'ONLINE' ? 'text-emerald-400' : server.status === 'OFFLINE' ? 'text-rose-400' : 'text-gold-400'}`} />

                <div className="flex items-center justify-between gap-4">
                  {/* Server info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Status indicator */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} ${cfg.glow}`} />
                      {server.status === 'ONLINE' && (
                        <div className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${cfg.ping} animate-ping opacity-30`} style={{ animationDuration: '3s' }} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-white/90 font-semibold truncate">{server.name}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          server.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' :
                          server.status === 'OFFLINE' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-gold-500/10 text-gold-400'
                        }`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <span className="text-white/25 text-sm truncate block mt-0.5 font-mono text-[13px]">
                        {server.url}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => server.id && setHistoryServerId(server.id)}
                      className="btn-ghost px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      Historial
                    </button>
                    <button
                      onClick={() => handleEdit(server)}
                      className="btn-ghost px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(server.id)}
                      disabled={deletingId === server.id}
                      className="btn-danger px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      {deletingId === server.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {/* Bottom shimmer on hover */}
                <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${
                  server.status === 'ONLINE' ? 'text-emerald-400' :
                  server.status === 'OFFLINE' ? 'text-rose-400' : 'text-gold-400'
                }`} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
