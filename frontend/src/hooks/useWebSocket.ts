import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { AlertMessage } from '../types'

interface UseWebSocketReturn {
  connected: boolean
  lastAlert: AlertMessage | null
  alerts: AlertMessage[]
  clearAlerts: () => void
}

export function useWebSocket(): UseWebSocketReturn {
  const clientRef = useRef<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastAlert, setLastAlert] = useState<AlertMessage | null>(null)
  const [alerts, setAlerts] = useState<AlertMessage[]>([])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/alerts', (message) => {
          const alert: AlertMessage = JSON.parse(message.body)
          setLastAlert(alert)
          setAlerts((prev) => [alert, ...prev].slice(0, 50))
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
    setLastAlert(null)
  }, [])

  return { connected, lastAlert, alerts, clearAlerts }
}
