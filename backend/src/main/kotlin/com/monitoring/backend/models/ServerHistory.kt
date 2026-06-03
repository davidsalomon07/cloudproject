package com.monitoring.backend.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "server_history")
class ServerHistory(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ServerStatus,

    @Column(nullable = false)
    var responseTime: Long,

    @Column(nullable = false)
    var timestamp: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    var server: Server
)