package com.monitoring.backend.scheduler

import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerRepository
import com.monitoring.backend.security.UrlValidator
import com.monitoring.backend.services.AlertService
import com.monitoring.backend.services.ServerHistoryService
import com.monitoring.backend.services.TelegramService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.net.HttpURLConnection
import java.net.URL

@Component
class ServerMonitoringScheduler(
    private val serverRepository: ServerRepository,
    private val serverHistoryService: ServerHistoryService,
    private val alertService: AlertService,
    private val telegramService: TelegramService,
    private val urlValidator: UrlValidator
) {

    @Scheduled(fixedRate = 30000)
    fun checkServers() {
        val servers = serverRepository.findAll()

        for (server in servers) {
            val previousStatus = server.status

            if (!urlValidator.isSafeMonitoringUrl(server.url)) {
                server.status = ServerStatus.OFFLINE
            } else {
                try {
                    val connection =
                        URL(server.url).openConnection() as HttpURLConnection

                    connection.requestMethod = "GET"
                    connection.connectTimeout = 5000
                    connection.readTimeout = 5000
                    connection.instanceFollowRedirects = false

                    val responseCode = connection.responseCode

                    server.status =
                        if (responseCode in 200..299) {
                            ServerStatus.ONLINE
                        } else {
                            ServerStatus.OFFLINE
                        }
                } catch (exception: Exception) {
                    server.status = ServerStatus.OFFLINE
                }
            }

            if (previousStatus != server.status) {
                val serverId = server.id
                if (serverId != null) {
                    serverHistoryService.recordChange(
                        serverId = serverId,
                        previousStatus = previousStatus,
                        newStatus = server.status
                    )
                    alertService.sendAlert(
                        serverName = server.name,
                        previousStatus = previousStatus,
                        currentStatus = server.status
                    )
                    telegramService.notifyStatusChange(
                        serverName = server.name,
                        previousStatus = previousStatus,
                        newStatus = server.status
                    )
                }
            }

            serverRepository.save(server)
        }
    }
}
