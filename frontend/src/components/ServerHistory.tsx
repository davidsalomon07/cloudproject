import { useEffect, useState } from 'react'
import type { ServerHistoryItem } from '../types'
import { STATUS_LABELS } from '../types'
import { api } from '../services/api'

interface Props {
  serverId: number | null
  onClose: () => void
}

export default function ServerHistory({ serverId, onClose }: Props) {
  const [history, setHistory] = useState<ServerHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const data = serverId
          ? await api.getHistoryByServer(serverId)
          : await api.getHistory()
        setHistory(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar historial')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [serverId])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const day = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const time = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    return { day, time }
  }

  const getChangeInfo = (from: string, to: string) => {
    if (to === 'ONLINE') return {
      icon: '🟢',
      dotColor: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      label: 'Volvió a línea',
      fromLabel: STATUS_LABELS[from as keyof typeof STATUS_LABELS] || from,
      borderGlow: 'border-emerald-500/20',
    }
    if (to === 'OFFLINE') return {
      icon: '🔴',
      dotColor: 'bg-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      label: 'Cayó fuera de línea',
      fromLabel: STATUS_LABELS[from as keyof typeof STATUS_LABELS] || from,
      borderGlow: 'border-rose-500/20',
    }
    return {
      icon: '🟡',
      dotColor: 'bg-gold-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      label: 'Cambió a desconocido',
      fromLabel: STATUS_LABELS[from as keyof typeof STATUS_LABELS] || from,
      borderGlow: 'border-gold-500/20',
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20 border border-cyan-500/20 flex items-center justify-center">
            <span className="text-lg">⏳</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {serverId ? `Historial del servidor` : 'Historial completo'}
            </h3>
            <p className="text-xs text-white/30 font-light">
              {serverId
                ? `Cambios de estado del servidor #${serverId}`
                : 'Todos los cambios registrados'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg glass text-white/30 hover:text-white/70 transition-all duration-200 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-4 h-4 rounded-full bg-white/5 mt-1" />
              <div className="flex-1">
                <div className="glass rounded-xl p-4">
                  <div className="h-4 bg-white/5 rounded-full w-40 mb-2" />
                  <div className="h-3 bg-white/5 rounded-full w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-xl p-5 border border-rose-500/20">
          <div className="flex items-center gap-3 text-rose-400 text-sm">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-4xl mb-4 opacity-30">📋</div>
          <p className="text-white/30 font-medium">No hay cambios registrados</p>
          <p className="text-white/20 text-sm mt-1">Los cambios aparecerán cuando los servidores cambien de estado</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-cyan-500/30 via-gold-500/20 to-fuchsia-500/30" />

          <div className="space-y-5">
            {history.map((item, i) => {
              const info = getChangeInfo(item.previousStatus, item.newStatus)
              const formatted = formatDate(item.timestamp)
              return (
                <div
                  key={item.id || i}
                  className="relative flex gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Dot */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-[14px] h-[14px] rounded-full ${info.dotColor} ${info.glow} border-2 border-deep-900 z-10 relative`} />
                    {item.newStatus === 'ONLINE' && (
                      <div className={`absolute inset-0 w-[14px] h-[14px] rounded-full ${info.dotColor} animate-ping opacity-40`} style={{ animationDuration: '3s' }} />
                    )}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 glass rounded-xl p-4 border ${info.borderGlow} transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.07]`}>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-white/90 text-sm font-medium">{info.label}</span>
                      <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                        {info.icon} {STATUS_LABELS[item.newStatus as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/25 font-light flex-wrap">
                      <span>{formatted.day}</span>
                      <span className="text-white/10">·</span>
                      <span>{formatted.time}</span>
                      {serverId === null && (
                        <>
                          <span className="text-white/10">·</span>
                          <span>Servidor #{item.serverId}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1.5 text-[11px] text-white/20 font-light">
                      Era {info.fromLabel}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
