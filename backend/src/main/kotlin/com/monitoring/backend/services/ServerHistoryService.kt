package com.monitoring.backend.services

import com.monitoring.backend.dto.ServerHistoryResponse
import com.monitoring.backend.models.ServerHistory
import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerHistoryRepository
import org.springframework.stereotype.Service

@Service
class ServerHistoryService(
    private val serverHistoryRepository: ServerHistoryRepository
) {

    fun recordChange(
        serverId: Long,
        previousStatus: ServerStatus,
        newStatus: ServerStatus
    ) {
        val history = ServerHistory(
            serverId = serverId,
            previousStatus = previousStatus,
            newStatus = newStatus
        )
        serverHistoryRepository.save(history)
    }

    fun getAllHistory(): List<ServerHistoryResponse> {
        return serverHistoryRepository.findAllByOrderByTimestampDesc()
            .map { toResponse(it) }
    }

    fun getHistoryByServerId(serverId: Long): List<ServerHistoryResponse> {
        return serverHistoryRepository.findByServerIdOrderByTimestampDesc(serverId)
            .map { toResponse(it) }
    }

    private fun toResponse(history: ServerHistory): ServerHistoryResponse {
        return ServerHistoryResponse(
            id = history.id,
            serverId = history.serverId,
            previousStatus = history.previousStatus,
            newStatus = history.newStatus,
            timestamp = history.timestamp
        )
    }
}
