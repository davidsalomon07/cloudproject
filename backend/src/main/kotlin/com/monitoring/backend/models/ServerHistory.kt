package com.monitoring.backend.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "server_history")
class ServerHistory(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "server_id", nullable = false)
    var serverId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var previousStatus: ServerStatus,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var newStatus: ServerStatus,

    @Column(nullable = false)
    var timestamp: LocalDateTime = LocalDateTime.now()
)
