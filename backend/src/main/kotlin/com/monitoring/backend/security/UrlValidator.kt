package com.monitoring.backend.security

import org.springframework.stereotype.Component
import java.net.InetAddress
import java.net.URI

@Component
class UrlValidator {

    private val blockedHosts = setOf(
        "localhost",
        "metadata.google.internal",
        "metadata.google",
        "169.254.169.254"
    )

    fun validate(url: String) {
        if (!isSafeMonitoringUrl(url)) {
            throw com.monitoring.backend.exceptions.InvalidUrlException(
                "URL no permitida: solo se aceptan http/https hacia hosts públicos"
            )
        }
    }

    fun isSafeMonitoringUrl(urlString: String): Boolean {
        return try {
            val uri = URI(urlString.trim())
            val scheme = uri.scheme?.lowercase()
            if (scheme !in ALLOWED_SCHEMES) {
                return false
            }

            val host = uri.host?.lowercase() ?: return false
            if (host in blockedHosts) {
                return false
            }

            val addresses = InetAddress.getAllByName(host)
            addresses.all { address ->
                !address.isAnyLocalAddress &&
                    !address.isLoopbackAddress &&
                    !address.isLinkLocalAddress &&
                    !address.isSiteLocalAddress &&
                    !address.hostAddress.startsWith("169.254.")
            }
        } catch (exception: Exception) {
            false
        }
    }

    companion object {
        private val ALLOWED_SCHEMES = setOf("http", "https")
    }
}
