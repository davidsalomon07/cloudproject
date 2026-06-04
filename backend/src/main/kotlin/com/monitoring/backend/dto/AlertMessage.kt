package com.monitoring.backend.dto

import com.monitoring.backend.models.ServerStatus
import java.time.LocalDateTime

data class AlertMessage(
    val serverName: String,
    val previousStatus: ServerStatus,
    val currentStatus: ServerStatus,
    val timestamp: LocalDateTime
)
