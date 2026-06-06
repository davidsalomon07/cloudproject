package com.monitoring.backend.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(-1) // Run before other filters
class SecurityHeadersFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        response.addHeader("X-Content-Type-Options", "nosniff")
        response.addHeader("X-Frame-Options", "DENY")
        response.addHeader("X-XSS-Protection", "1; mode=block")
        response.addHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        response.addHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';")
        response.addHeader("Referrer-Policy", "no-referrer")

        filterChain.doFilter(request, response)
    }
}
