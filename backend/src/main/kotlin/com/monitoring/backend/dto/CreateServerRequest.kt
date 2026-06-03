package com.monitoring.backend.dto

data class CreateServerRequest(
    val name: String,
    val url: String
)