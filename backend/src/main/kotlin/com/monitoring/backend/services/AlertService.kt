package com.monitoring.backend.services

import com.monitoring.backend.dto.AlertMessage
import com.monitoring.backend.models.ServerStatus
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AlertService(
    private val messagingTemplate: SimpMessagingTemplate
) {

    fun sendAlert(
        serverName: String,
        previousStatus: ServerStatus,
        currentStatus: ServerStatus
    ) {
        val alert = AlertMessage(
            serverName = serverName,
            previousStatus = previousStatus,
            currentStatus = currentStatus,
            timestamp = LocalDateTime.now()
        )
        messagingTemplate.convertAndSend("/topic/alerts", alert)
    }
}
