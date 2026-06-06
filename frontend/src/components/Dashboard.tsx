import { useEffect, useState } from 'react'
import type { DashboardResponse } from '../types'
import { api } from '../services/api'

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await api.getDashboard()
        setData(response)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
    const interval = setInterval(fetchDashboard, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-3 bg-white/5 rounded-full w-24 mb-4" />
            <div className="h-8 bg-white/5 rounded-full w-16 mb-3" />
            <div className="h-1.5 bg-white/5 rounded-full w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 border border-rose-500/20">
        <div className="flex items-center gap-3 text-rose-400 text-sm">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  const percentage = Math.round(data.availabilityPercentage * 10) / 10
  const isHealthy = percentage >= 99
  const isWarning = percentage >= 95

  const cards = [
    {
      label: 'Total servidores',
      value: data.totalServers,
      icon: '🖥️',
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderGlow: 'border-cyan-500/20',
      delay: 0,
    },
    {
      label: 'En línea',
      value: data.onlineServers,
      icon: '🟢',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderGlow: 'border-emerald-500/20',
      delay: 100,
    },
    {
      label: 'Fuera de línea',
      value: data.offlineServers,
      icon: '🔴',
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderGlow: 'border-rose-500/20',
      delay: 200,
    },
    {
      label: 'Disponibilidad',
      value: `${percentage}%`,
      icon: '📈',
      gradient: isHealthy
        ? 'from-emerald-500/10 via-emerald-500/5 to-transparent'
        : isWarning
        ? 'from-gold-500/10 via-gold-500/5 to-transparent'
        : 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderGlow: isHealthy
        ? 'border-emerald-500/20'
        : isWarning
        ? 'border-gold-500/20'
        : 'border-rose-500/20',
      delay: 300,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group relative glass rounded-2xl p-6 border ${card.borderGlow} overflow-hidden animate-fade-in-up hover:scale-[1.02] transition-all duration-500`}
          style={{ animationDelay: `${card.delay}ms` }}
        >
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

          {/* Icon */}
          <div className="relative flex items-center justify-between mb-3">
            <span className="text-white/30 text-[11px] font-medium uppercase tracking-[0.15em]">
              {card.label}
            </span>
            <span className="text-xl animate-float" style={{ animationDelay: `${card.delay}ms` }}>
              {card.icon}
            </span>
          </div>

          {/* Value */}
          <div className="relative text-3xl font-extrabold tracking-tight text-white">
            {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
          </div>

          {/* Progress bar for availability */}
          {card.label === 'Disponibilidad' && data.totalServers > 0 && (
            <div className="relative mt-4">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full animate-gradient-shift ${
                    isHealthy
                      ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400'
                      : isWarning
                      ? 'bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400'
                      : 'bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400'
                  }`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    animation: 'progress-fill 1s ease-out forwards, gradient-shift 2s ease infinite',
                    backgroundSize: '200% 200%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={`absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-transparent ${card.borderGlow.replace('border-', 'via-').replace('/20', '/40')}`} />
            <div className={`absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-transparent ${card.borderGlow.replace('border-', 'via-').replace('/20', '/40')}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
