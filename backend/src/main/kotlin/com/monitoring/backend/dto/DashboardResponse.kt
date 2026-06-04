package com.monitoring.backend.dto

data class DashboardResponse(
    val totalServers: Int,
    val onlineServers: Int,
    val offlineServers: Int,
    val availabilityPercentage: Double
)
