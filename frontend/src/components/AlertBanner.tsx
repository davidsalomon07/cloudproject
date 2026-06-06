import { useEffect, useState, useRef } from 'react'
import type { AlertMessage } from '../types'
import { STATUS_LABELS } from '../types'

interface Props {
  alerts: AlertMessage[]
  connected: boolean
  onClear: () => void
}

interface Toast {
  id: string
  alert: AlertMessage
  exiting: boolean
  createdAt: number
}

export default function AlertBanner({ alerts, connected, onClear }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const soundPlayed = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (alerts.length === 0) return

    const latest = alerts[0]
    const id = `${latest.serverName}-${latest.timestamp}-${Date.now()}`

    // Avoid duplicates
    if (soundPlayed.current.has(id)) return
    soundPlayed.current.add(id)

    const toast: Toast = { id, alert: latest, exiting: false, createdAt: Date.now() }
    setToasts((prev) => [toast, ...prev].slice(0, 4))

    // Start exit animation after 6s
    const exitTimer = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
    }, 6000)

    // Remove after animation completes
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6500)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [alerts])

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {/* Connection indicator */}
      <div className="flex items-center justify-end gap-2 px-1">
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
          <div className="relative w-2 h-2">
            <div className={`absolute inset-0 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {connected && (
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" style={{ animationDuration: '2.5s' }} />
            )}
          </div>
          <span className="text-[11px] text-white/35 font-medium">
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Clear button */}
      {toasts.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onClear}
            className="text-[11px] text-white/25 hover:text-white/50 glass px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Toasts */}
      {toasts.map((toast) => {
        const { alert, exiting } = toast
        const isOffline = alert.currentStatus === 'OFFLINE'
        const timeLeft = 6500 - (Date.now() - toast.createdAt)
        const progressPct = Math.max(0, (timeLeft / 6500) * 100)

        return (
          <div
            key={toast.id}
            className={`
              relative overflow-hidden
              ${exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
              ${isOffline
                ? 'glass-strong border border-rose-500/20'
                : 'glass-strong border border-emerald-500/20'
              }
              rounded-2xl shadow-2xl
            `}
            onClick={() => handleDismiss(toast.id)}
          >
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
              <div
                className={`h-full transition-all duration-300 ease-linear ${
                  isOffline ? 'bg-rose-500/30' : 'bg-emerald-500/30'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Top accent */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${
              isOffline ? 'text-rose-400' : 'text-emerald-400'
            }`} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                    isOffline
                      ? 'bg-rose-500/10'
                      : 'bg-emerald-500/10'
                  }`}>
                    {isOffline ? '🔴' : '🟢'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/90 text-sm font-medium truncate">{alert.serverName}</p>
                    <span className="text-[10px] text-white/20 flex-shrink-0">{formatTime(alert.timestamp)}</span>
                  </div>
                  <p className={`text-xs mt-0.5 font-light ${
                    isOffline ? 'text-rose-300/70' : 'text-emerald-300/70'
                  }`}>
                    {isOffline
                      ? `Cayó — estaba ${STATUS_LABELS[alert.previousStatus]}`
                      : `Volvió — estaba ${STATUS_LABELS[alert.previousStatus]}`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismiss(toast.id) }}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/20 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
