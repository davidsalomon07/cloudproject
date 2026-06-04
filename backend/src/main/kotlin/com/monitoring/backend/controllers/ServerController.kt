package com.monitoring.backend.controllers

import com.monitoring.backend.dto.CreateServerRequest
import com.monitoring.backend.dto.ServerResponse
import com.monitoring.backend.dto.UpdateServerRequest
import com.monitoring.backend.services.ServerService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/servers")
class ServerController(
    private val serverService: ServerService
) {

    @GetMapping
    fun getAllServers(): List<ServerResponse> {
        return serverService.getAllServers()
    }

    @GetMapping("/{id}")
    fun getServerById(
        @PathVariable id: Long
    ): ServerResponse {
        return serverService.getServerById(id)
    }

    @PostMapping
    fun createServer(
        @Valid @RequestBody request: CreateServerRequest
    ): ServerResponse {
        return serverService.createServer(request)
    }

    @PutMapping("/{id}")
    fun updateServer(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateServerRequest
    ): ServerResponse {
        return serverService.updateServer(id, request)
    }

    @DeleteMapping("/{id}")
    fun deleteServer(
        @PathVariable id: Long
    ) {
        serverService.deleteServer(id)
    }
}
