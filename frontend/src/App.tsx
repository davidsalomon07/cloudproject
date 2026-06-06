import { useState, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import ServerList from './components/ServerList'
import ServerHistory from './components/ServerHistory'
import AlertBanner from './components/AlertBanner'
import { useWebSocket } from './hooks/useWebSocket'

type Tab = 'dashboard' | 'servers' | 'history'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { connected, alerts, clearAlerts } = useWebSocket()
  const [configOpen, setConfigOpen] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('apiKey') || '')

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('apiKey', apiKeyInput.trim())
    } else {
      localStorage.removeItem('apiKey')
    }
    setConfigOpen(false)
    handleRefresh()
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'servers', label: 'Servidores', icon: '🖥️' },
    { id: 'history', label: 'Historial', icon: '⏳' },
  ]

  return (
    <div className="min-h-screen text-white">
      {/* Animated Mesh Background */}
      <div className="bg-mesh" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl animate-breathe" />
                <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl opacity-60 blur-md" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <span className="font-extrabold text-sm text-deep-900 drop-shadow-sm">M</span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Monitor
                </h1>
                <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase -mt-0.5">
                  Servidores
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Connection pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
                <div className="relative w-2 h-2">
                  <div className={`absolute inset-0 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div
                    className={`absolute inset-0 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping opacity-40`}
                    style={{ animationDuration: '2.5s' }}
                  />
                </div>
                <span className="text-white/50 font-medium">
                  {connected ? 'En vivo' : 'Desconectado'}
                </span>
              </div>

              {/* Config */}
              <div className="relative">
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl glass text-white/50 hover:text-white/90 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  title="Configuración"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {configOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 glass-strong rounded-2xl shadow-2xl p-4 animate-fade-in-scale origin-top-right z-50">
                    <h4 className="text-sm font-semibold text-white/90 mb-3">Configuración</h4>
                    <label className="block text-xs text-white/40 mb-1.5 font-medium" htmlFor="apikey">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="apikey"
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Ingresa tu API Key"
                        className="input-glass flex-1 px-3 py-2 rounded-xl text-sm"
                      />
                      <button
                        onClick={handleSaveApiKey}
                        className="btn-glow btn-gold px-3 py-2 rounded-xl text-sm cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                    <p className="text-xs text-white/25 mt-2">
                      La API Key se guarda localmente en tu navegador.
                    </p>
                  </div>
                )}
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="w-9 h-9 flex items-center justify-center rounded-xl glass text-white/50 hover:text-white/90 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                title="Actualizar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-gold-400'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 via-gold-500 to-cyan-500 rounded-full animate-fade-in-scale" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                  Panel de control
                </h2>
                <p className="text-white/30 text-sm mt-1 font-light tracking-wide">
                  Resumen del estado de tus servidores en tiempo real
                </p>
              </div>
            </div>
            <Dashboard />
            <div className="mt-8">
              <ServerList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
            </div>
          </div>
        )}

        {activeTab === 'servers' && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                Servidores
              </h2>
              <p className="text-white/30 text-sm mt-1 font-light tracking-wide">
                Administra y monitorea tus servidores
              </p>
            </div>
            <ServerList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                Historial
              </h2>
              <p className="text-white/30 text-sm mt-1 font-light tracking-wide">
                Línea de tiempo de cambios de estado
              </p>
            </div>
            <div className="glass-strong rounded-2xl p-6 md:p-8">
              <ServerHistory serverId={null} onClose={() => setActiveTab('dashboard')} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-white/20">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span className="font-bold text-[9px] text-deep-900">M</span>
              </div>
              Monitor de Servidores
            </div>
            <div className="flex items-center gap-4 text-xs text-white/20">
              <span>© 2026</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>Tiempo real con WebSocket</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Real-time alerts */}
      <AlertBanner alerts={alerts} connected={connected} onClear={clearAlerts} />
    </div>
  )
}
