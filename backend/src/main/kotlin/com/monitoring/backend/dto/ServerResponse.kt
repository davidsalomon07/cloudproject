package com.monitoring.backend.dto

import com.monitoring.backend.models.ServerStatus

data class ServerResponse(
    val id: Long?,
    val name: String,
    val url: String,
    val status: ServerStatus
)