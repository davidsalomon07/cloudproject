package com.monitoring.backend.services

import com.monitoring.backend.dto.CreateServerRequest
import com.monitoring.backend.dto.ServerResponse
import com.monitoring.backend.dto.UpdateServerRequest
import com.monitoring.backend.exceptions.ResourceNotFoundException
import com.monitoring.backend.models.Server
import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerRepository
import com.monitoring.backend.security.UrlValidator
import org.springframework.stereotype.Service

@Service
class ServerService(
    private val serverRepository: ServerRepository,
    private val urlValidator: UrlValidator
) {

    fun getAllServers(): List<ServerResponse> {
        return serverRepository.findAll().map { toResponse(it) }
    }

    fun getServerById(id: Long): ServerResponse {
        val server = serverRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Servidor no encontrado") }

        return toResponse(server)
    }

    fun createServer(request: CreateServerRequest): ServerResponse {
        urlValidator.validate(request.url)

        val server = Server(
            name = request.name.trim(),
            url = request.url.trim(),
            status = ServerStatus.UNKNOWN
        )

        val savedServer = serverRepository.save(server)
        return toResponse(savedServer)
    }

    fun updateServer(id: Long, request: UpdateServerRequest): ServerResponse {
        urlValidator.validate(request.url)

        val server = serverRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Servidor no encontrado") }

        server.name = request.name.trim()
        server.url = request.url.trim()

        val updatedServer = serverRepository.save(server)
        return toResponse(updatedServer)
    }

    fun deleteServer(id: Long) {
        if (!serverRepository.existsById(id)) {
            throw ResourceNotFoundException("Servidor no encontrado")
        }
        serverRepository.deleteById(id)
    }

    private fun toResponse(server: Server): ServerResponse {
        return ServerResponse(
            server.id,
            server.name,
            server.url,
            server.status
        )
    }
}
