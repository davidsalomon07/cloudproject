package com.monitoring.backend.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class UpdateServerRequest(
    @field:NotBlank(message = "El nombre es obligatorio")
    @field:Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    val name: String,

    @field:NotBlank(message = "La URL es obligatoria")
    @field:Size(max = 2048, message = "La URL no puede superar 2048 caracteres")
    @field:Pattern(
        regexp = "^https?://\\S+$",
        message = "La URL debe comenzar con http:// o https://"
    )
    val url: String
)
