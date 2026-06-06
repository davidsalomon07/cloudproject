import { useState, useEffect } from 'react'
import type { Server } from '../types'
import { api } from '../services/api'

interface Props {
  server: Server | null
  onClose: () => void
}

export default function ServerForm({ server, onClose }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditing = server !== null

  useEffect(() => {
    if (server) {
      setName(server.name)
      setUrl(server.url)
    }
  }, [server])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!url.trim()) {
      setError('La URL es obligatoria')
      return
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('La URL debe comenzar con http:// o https://')
      return
    }

    setSubmitting(true)
    try {
      if (isEditing && server.id) {
        await api.updateServer(server.id, { name: name.trim(), url: url.trim() })
        setSuccess('Servidor actualizado correctamente')
      } else {
        await api.createServer({ name: name.trim(), url: url.trim() })
        setSuccess('Servidor creado correctamente')
      }
      setTimeout(onClose, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar servidor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-500/20 flex items-center justify-center">
            <span className="text-lg">{isEditing ? '✏️' : '➕'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? 'Editar servidor' : 'Nuevo servidor'}
            </h3>
            <p className="text-xs text-white/30 font-light">
              {isEditing ? 'Actualiza los datos del servidor' : 'Agrega un servidor para monitorear'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg glass text-white/30 hover:text-white/70 transition-all duration-200 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="mb-5 glass rounded-xl p-4 border border-rose-500/20 animate-fade-in-down">
          <div className="flex items-center gap-2.5 text-rose-400 text-sm">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="mb-5 glass rounded-xl p-4 border border-emerald-500/20 animate-fade-in-down">
          <div className="flex items-center gap-2.5 text-emerald-400 text-sm">
            <span>✅</span>
            {success}
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5">
        <div className="group">
          <label htmlFor="name" className="block text-sm font-medium text-white/50 mb-2 group-focus-within:text-gold-400 transition-colors duration-200">
            Nombre del servidor
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Servidor de producción"
            className="input-glass w-full px-4 py-3 rounded-xl text-sm"
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="group">
          <label htmlFor="url" className="block text-sm font-medium text-white/50 mb-2 group-focus-within:text-gold-400 transition-colors duration-200">
            URL del servidor
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            className="input-glass w-full px-4 py-3 rounded-xl text-sm font-mono"
            maxLength={2048}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost px-5 py-2.5 rounded-xl text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-glow btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isEditing ? 'Guardar cambios' : 'Crear servidor'}
        </button>
      </div>
    </form>
  )
}
