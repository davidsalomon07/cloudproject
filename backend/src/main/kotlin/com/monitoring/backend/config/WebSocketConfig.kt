package com.monitoring.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig(
    @Value("\${app.frontend-origin:http://localhost:5173}") private val frontendOrigin: String
) : WebSocketMessageBrokerConfigurer {

    private val allowedOrigins: Array<String> = frontendOrigin
        .split(",")
        .map { it.trim() }
        .filter { it.isNotEmpty() }
        .toTypedArray()

    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins(*allowedOrigins)
            .withSockJS()
    }
}
