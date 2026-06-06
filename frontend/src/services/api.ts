import type { Server, ServerHistoryItem, DashboardResponse } from '../types'

const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const apiKey = localStorage.getItem('apiKey')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new Error(error.error || `Error ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // Dashboard
  getDashboard(): Promise<DashboardResponse> {
    return request('/dashboard')
  },

  // Servidores
  getServers(): Promise<Server[]> {
    return request('/servers')
  },

  getServer(id: number): Promise<Server> {
    return request(`/servers/${id}`)
  },

  createServer(data: { name: string; url: string }): Promise<Server> {
    return request('/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateServer(id: number, data: { name: string; url: string }): Promise<Server> {
    return request(`/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteServer(id: number): Promise<void> {
    return request(`/servers/${id}`, { method: 'DELETE' })
  },

  // Historial
  getHistory(): Promise<ServerHistoryItem[]> {
    return request('/history')
  },

  getHistoryByServer(serverId: number): Promise<ServerHistoryItem[]> {
    return request(`/history/${serverId}`)
  },
}
