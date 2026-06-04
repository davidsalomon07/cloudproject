package com.monitoring.backend.controllers

import com.monitoring.backend.dto.DashboardResponse
import com.monitoring.backend.services.DashboardService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {

    @GetMapping
    fun getDashboard(): DashboardResponse {
        return dashboardService.getDashboard()
    }
}
