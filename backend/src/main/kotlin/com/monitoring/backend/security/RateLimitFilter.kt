package com.monitoring.backend.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Component
@Order(0)
class RateLimitFilter(
    @Value("\${app.rate-limit.max-requests:30}") private val maxRequests: Int,
    @Value("\${app.rate-limit.window-seconds:60}") private val windowSeconds: Long
) : OncePerRequestFilter() {

    private val requestCounts = ConcurrentHashMap<String, MutableList<Instant>>()

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        if (!request.servletPath.startsWith("/api/")) {
            return true
        }
        return request.method !in WRITE_METHODS
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val clientKey = resolveClientKey(request)
        val now = Instant.now()
        val windowStart = now.minusSeconds(windowSeconds)

        val timestamps = requestCounts.computeIfAbsent(clientKey) { mutableListOf() }
        synchronized(timestamps) {
            timestamps.removeIf { it.isBefore(windowStart) }
            if (timestamps.size >= maxRequests) {
                response.status = 429
                response.contentType = "application/json"
                response.writer.write("""{"error":"Demasiadas solicitudes, intente más tarde"}""")
                return
            }
            timestamps.add(now)
        }

        filterChain.doFilter(request, response)
    }

    private fun resolveClientKey(request: HttpServletRequest): String {
        val forwardedFor = request.getHeader("X-Forwarded-For")
        if (!forwardedFor.isNullOrBlank()) {
            return forwardedFor.split(",").first().trim()
        }
        return request.remoteAddr ?: "unknown"
    }

    companion object {
        private val WRITE_METHODS = setOf("POST", "PUT", "DELETE")
    }
}
