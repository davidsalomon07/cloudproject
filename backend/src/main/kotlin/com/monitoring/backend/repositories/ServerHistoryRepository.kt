package com.monitoring.backend.repositories

import com.monitoring.backend.models.ServerHistory
import org.springframework.data.jpa.repository.JpaRepository

interface ServerHistoryRepository : JpaRepository<ServerHistory, Long> {

    fun findAllByOrderByTimestampDesc(): List<ServerHistory>

    fun findByServerIdOrderByTimestampDesc(serverId: Long): List<ServerHistory>
}
