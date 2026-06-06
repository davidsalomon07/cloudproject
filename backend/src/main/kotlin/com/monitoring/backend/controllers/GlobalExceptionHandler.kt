package com.monitoring.backend.controllers

import com.monitoring.backend.exceptions.InvalidUrlException
import com.monitoring.backend.exceptions.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataAccessException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(exception: ResourceNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf("error" to (exception.message ?: "Recurso no encontrado")))
    }

    @ExceptionHandler(InvalidUrlException::class)
    fun handleInvalidUrl(exception: InvalidUrlException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to (exception.message ?: "URL inválida")))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(exception: MethodArgumentNotValidException): ResponseEntity<Map<String, String>> {
        val message = exception.bindingResult.fieldErrors
            .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to message))
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(
        exception: DataIntegrityViolationException
    ): ResponseEntity<Map<String, String>> {
        logger.warn("Violación de integridad de datos: ", exception)
        val message = if (exception.message?.contains("uq_servers_url") == true) {
            "La URL ya está registrada"
        } else {
            "Conflicto de integridad de datos"
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(mapOf("error" to message))
    }

    @ExceptionHandler(DataAccessException::class)
    fun handleDatabaseError(exception: DataAccessException): ResponseEntity<Map<String, String>> {
        logger.error("Error de base de datos crítico: ", exception)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("error" to "Error interno del sistema de persistencia. Contacte al administrador."))
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(exception: Exception): ResponseEntity<Map<String, String>> {
        logger.error("Error inesperado en el sistema: ", exception)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("error" to "Ocurrió un error interno inesperado."))
    }
}
