export type ServerStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'

export interface Server {
  id: number | null
  name: string
  url: string
  status: ServerStatus
}

export interface CreateServerRequest {
  name: string
  url: string
}

export interface UpdateServerRequest {
  name: string
  url: string
}

export interface ServerHistoryItem {
  id: number | null
  serverId: number
  previousStatus: ServerStatus
  newStatus: ServerStatus
  timestamp: string
}

export interface DashboardResponse {
  totalServers: number
  onlineServers: number
  offlineServers: number
  availabilityPercentage: number
}

export interface AlertMessage {
  serverName: string
  previousStatus: ServerStatus
  currentStatus: ServerStatus
  timestamp: string
}

export const STATUS_LABELS: Record<ServerStatus, string> = {
  ONLINE: 'En línea',
  OFFLINE: 'Fuera de línea',
  UNKNOWN: 'Desconocido',
}

export const STATUS_COLORS: Record<ServerStatus, string> = {
  ONLINE: 'bg-success-500',
  OFFLINE: 'bg-danger-500',
  UNKNOWN: 'bg-warning-500',
}

export const STATUS_TEXT_COLORS: Record<ServerStatus, string> = {
  ONLINE: 'text-success-500',
  OFFLINE: 'text-danger-500',
  UNKNOWN: 'text-warning-500',
}
