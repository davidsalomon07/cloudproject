package com.monitoring.backend.dto

import com.monitoring.backend.models.ServerStatus
import java.time.LocalDateTime

data class ServerHistoryResponse(
    val id: Long?,
    val serverId: Long,
    val previousStatus: ServerStatus,
    val newStatus: ServerStatus,
    val timestamp: LocalDateTime
)
