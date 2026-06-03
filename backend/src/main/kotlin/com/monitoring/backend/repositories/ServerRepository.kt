package com.monitoring.backend.repositories

import com.monitoring.backend.models.Server
import org.springframework.data.jpa.repository.JpaRepository

interface ServerRepository : JpaRepository<Server, Long>