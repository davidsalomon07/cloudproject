package com.monitoring.backend.security

import com.monitoring.backend.exceptions.InvalidUrlException
import org.springframework.stereotype.Component
import java.net.InetAddress
import java.net.URI

@Component
class UrlValidator {

    private val blockedHosts = setOf(
        "localhost",
        "metadata.google.internal",
        "metadata.google",
        "169.254.169.254",
        "127.0.0.1",
        "0.0.0.0",
        "metadata.amazonaws.com",
        "metadata.azure.internal",
        "100.100.100.200"
    )

    fun validate(url: String) {
        if (!isSafeMonitoringUrl(url)) {
            throw InvalidUrlException(
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

            if (host in blockedHosts || isPrivateHost(host)) {
                return false
            }

            val addresses = InetAddress.getAllByName(host)
            addresses.all { address ->
                val hostAddress = address.hostAddress
                !address.isAnyLocalAddress &&
                    !address.isLoopbackAddress &&
                    !address.isLinkLocalAddress &&
                    !address.isSiteLocalAddress &&
                    !hostAddress.startsWith("169.254.") &&
                    !hostAddress.startsWith("0.")
            }
        } catch (exception: Exception) {
            false
        }
    }

    private fun isPrivateHost(host: String): Boolean {
        if (!isIpAddress(host)) return false
        return host == "127.0.0.1" ||
            host == "0.0.0.0" ||
            host.startsWith("10.") ||
            host.startsWith("192.168.") ||
            host.startsWith("169.254.") ||
            isInPrivate172Range(host)
    }

    private fun isIpAddress(host: String): Boolean {
        return host.matches(Regex("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$"))
    }

    private fun isInPrivate172Range(ip: String): Boolean {
        if (!ip.startsWith("172.")) return false
        val secondOctet = ip.split(".").getOrNull(1)?.toIntOrNull() ?: return false
        return secondOctet in 16..31
    }

    companion object {
        private val ALLOWED_SCHEMES = setOf("http", "https")
    }
}
