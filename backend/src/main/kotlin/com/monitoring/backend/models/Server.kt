package com.monitoring.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "servers")
class Server(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false, unique = true)
    var url: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ServerStatus = ServerStatus.UNKNOWN
)