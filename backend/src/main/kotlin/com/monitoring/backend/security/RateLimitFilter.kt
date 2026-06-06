package com.monitoring.backend.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@Component
@Order(0)
class RateLimitFilter(
    @Value("\${app.rate-limit.max-requests:30}") private val maxRequests: Int,
    @Value("\${app.rate-limit.window-seconds:60}") private val windowSeconds: Long
) : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(RateLimitFilter::class.java)
    private val requestCounts = ConcurrentHashMap<String, MutableList<Instant>>()

    init {
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate({
            cleanupStaleEntries()
        }, windowSeconds, windowSeconds, TimeUnit.SECONDS)
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        return !request.servletPath.startsWith("/api/")
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
                logger.warn("Rate limit excedido para IP: $clientKey en path: ${request.servletPath}")
                response.status = 429
                response.contentType = "application/json"
                response.writer.write("""{"error":"Demasiadas solicitudes, intente más tarde"}""")
                return
            }
            timestamps.add(now)
        }

        response.addHeader("X-RateLimit-Limit", maxRequests.toString())
        response.addHeader("X-RateLimit-Remaining", (maxRequests - timestamps.size).toString())

        filterChain.doFilter(request, response)
    }

    private fun cleanupStaleEntries() {
        val cutoff = Instant.now().minusSeconds(windowSeconds)
        requestCounts.entries.removeIf { (_, timestamps) ->
            synchronized(timestamps) {
                timestamps.removeIf { it.isBefore(cutoff) }
                timestamps.isEmpty()
            }
        }
    }

    private fun resolveClientKey(request: HttpServletRequest): String {
        val forwardedFor = request.getHeader("X-Forwarded-For")
        if (!forwardedFor.isNullOrBlank()) {
            return forwardedFor.split(",").first().trim()
        }
        val realIp = request.getHeader("X-Real-IP")
        if (!realIp.isNullOrBlank()) {
            return realIp.trim()
        }
        return request.remoteAddr ?: "unknown"
    }
}
