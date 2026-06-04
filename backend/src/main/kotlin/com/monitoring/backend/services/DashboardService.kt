package com.monitoring.backend.services

import com.monitoring.backend.dto.DashboardResponse
import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerRepository
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val serverRepository: ServerRepository
) {

    fun getDashboard(): DashboardResponse {
        val servers = serverRepository.findAll()
        val total = servers.size
        val online = servers.count { it.status == ServerStatus.ONLINE }
        val offline = servers.count { it.status == ServerStatus.OFFLINE }
        val availabilityPercentage =
            if (total > 0) (online.toDouble() / total.toDouble()) * 100.0 else 0.0

        return DashboardResponse(
            totalServers = total,
            onlineServers = online,
            offlineServers = offline,
            availabilityPercentage = availabilityPercentage
        )
    }
}
