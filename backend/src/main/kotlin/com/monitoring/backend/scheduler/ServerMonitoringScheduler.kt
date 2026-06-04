package com.monitoring.backend.scheduler

import com.monitoring.backend.models.ServerStatus
import com.monitoring.backend.repositories.ServerRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.net.HttpURLConnection
import java.net.URL

@Component
class ServerMonitoringScheduler(
    private val serverRepository: ServerRepository
) {

    @Scheduled(fixedRate = 30000)
    fun checkServers() {

        val servers = serverRepository.findAll()

        for (server in servers) {

            try {

                val connection =
                    URL(server.url).openConnection() as HttpURLConnection

                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000

                val responseCode = connection.responseCode

                server.status =
                    if (responseCode in 200..299)
                        ServerStatus.ONLINE
                    else
                        ServerStatus.OFFLINE

            } catch (e: Exception) {

                server.status = ServerStatus.OFFLINE
            }

            serverRepository.save(server)
        }
    }
}