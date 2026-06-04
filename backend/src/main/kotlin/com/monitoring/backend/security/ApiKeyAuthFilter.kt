package com.monitoring.backend.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(1)
class ApiKeyAuthFilter(
    @Value("\${app.api-key:}") private val configuredApiKey: String
) : OncePerRequestFilter() {

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        return !request.servletPath.startsWith("/api/")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (configuredApiKey.isBlank()) {
            filterChain.doFilter(request, response)
            return
        }

        val providedKey = request.getHeader("X-API-Key")
        if (providedKey != configuredApiKey) {
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = "application/json"
            response.writer.write("""{"error":"API key inválida o ausente"}""")
            return
        }

        filterChain.doFilter(request, response)
    }
}
