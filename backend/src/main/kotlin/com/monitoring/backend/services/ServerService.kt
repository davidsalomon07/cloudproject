package com.monitoring.backend.services

import com.monitoring.backend.dto.CreateServerRequest
import com.monitoring.backend.dto.ServerResponse
import com.monitoring.backend.dto.UpdateServerRequest
import com.monitoring.backend.models.Server
import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerRepository
import org.springframework.stereotype.Service

@Service
class ServerService(
    private val serverRepository: ServerRepository
) {

    fun getAllServers(): List<ServerResponse> {
        return serverRepository.findAll().map {
            ServerResponse(
                it.id,
                it.name,
                it.url,
                it.status
            )
        }
    }

    fun getServerById(id: Long): ServerResponse {
        val server = serverRepository.findById(id)
            .orElseThrow { RuntimeException("Servidor no encontrado") }

        return ServerResponse(
            server.id,
            server.name,
            server.url,
            server.status
        )
    }

    fun createServer(request: CreateServerRequest): ServerResponse {

        val server = Server(
            name = request.name,
            url = request.url,
            status = ServerStatus.UNKNOWN
        )

        val savedServer = serverRepository.save(server)

        return ServerResponse(
            savedServer.id,
            savedServer.name,
            savedServer.url,
            savedServer.status
        )
    }

    fun updateServer(id: Long, request: UpdateServerRequest): ServerResponse {

        val server = serverRepository.findById(id)
            .orElseThrow { RuntimeException("Servidor no encontrado") }

        server.name = request.name
        server.url = request.url

        val updatedServer = serverRepository.save(server)

        return ServerResponse(
            updatedServer.id,
            updatedServer.name,
            updatedServer.url,
            updatedServer.status
        )
    }

    fun deleteServer(id: Long) {
        serverRepository.deleteById(id)
    }

}