package com.monitoring.backend.services

import com.monitoring.backend.models.ServerStatus
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class TelegramService(
    @Value("\${telegram.bot-token:}") private val botToken: String,
    @Value("\${telegram.chat-id:}") private val chatId: String
) {

    private val logger = LoggerFactory.getLogger(TelegramService::class.java)
    private val restClient = RestClient.create()
    private val timeFormatter = DateTimeFormatter.ofPattern("HH:mm")

    fun notifyStatusChange(
        serverName: String,
        previousStatus: ServerStatus,
        newStatus: ServerStatus
    ) {
        if (botToken.isBlank() || chatId.isBlank()) {
            return
        }

        val message = when (newStatus) {
            ServerStatus.OFFLINE ->
                "Servidor $serverName cayó a las ${LocalDateTime.now().format(timeFormatter)}"
            ServerStatus.ONLINE ->
                "Servidor $serverName volvió a estar ONLINE a las ${LocalDateTime.now().format(timeFormatter)}"
            ServerStatus.UNKNOWN -> return
        }

        try {
            restClient.post()
                .uri("https://api.telegram.org/bot$botToken/sendMessage")
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    mapOf(
                        "chat_id" to chatId,
                        "text" to message
                    )
                )
                .retrieve()
                .toBodilessEntity()
        } catch (exception: Exception) {
            logger.warn("No se pudo enviar notificación a Telegram")
        }
    }
}
