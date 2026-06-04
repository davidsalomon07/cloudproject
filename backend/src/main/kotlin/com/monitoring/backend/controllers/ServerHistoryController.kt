package com.monitoring.backend.controllers

import com.monitoring.backend.dto.ServerHistoryResponse
import com.monitoring.backend.services.ServerHistoryService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/history")
class ServerHistoryController(
    private val serverHistoryService: ServerHistoryService
) {

    @GetMapping
    fun getAllHistory(): List<ServerHistoryResponse> {
        return serverHistoryService.getAllHistory()
    }

    @GetMapping("/{serverId}")
    fun getHistoryByServerId(
        @PathVariable serverId: Long
    ): List<ServerHistoryResponse> {
        return serverHistoryService.getHistoryByServerId(serverId)
    }
}
