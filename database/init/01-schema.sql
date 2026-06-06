-- MicroCheck - Esquema inicial PostgreSQL
-- DBA: Leonardo Falconí
-- Alineado con entidades JPA: Server, ServerHistory

CREATE TABLE IF NOT EXISTS servers (
    id      BIGSERIAL       PRIMARY KEY,
    name    VARCHAR(255)    NOT NULL,
    url     VARCHAR(255)    NOT NULL,
    status  VARCHAR(255)    NOT NULL DEFAULT 'UNKNOWN',
    CONSTRAINT uq_servers_url UNIQUE (url),
    CONSTRAINT chk_servers_status CHECK (status IN ('ONLINE', 'OFFLINE', 'UNKNOWN'))
);

CREATE TABLE IF NOT EXISTS server_history (
    id               BIGSERIAL       PRIMARY KEY,
    server_id        BIGINT          NOT NULL,
    previous_status  VARCHAR(255)    NOT NULL,
    new_status       VARCHAR(255)    NOT NULL,
    timestamp        TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_server
        FOREIGN KEY (server_id) REFERENCES servers(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_history_previous_status
        CHECK (previous_status IN ('ONLINE', 'OFFLINE', 'UNKNOWN')),
    CONSTRAINT chk_history_new_status
        CHECK (new_status IN ('ONLINE', 'OFFLINE', 'UNKNOWN'))
);

CREATE INDEX IF NOT EXISTS idx_server_history_server_id
    ON server_history (server_id);

CREATE INDEX IF NOT EXISTS idx_server_history_timestamp_desc
    ON server_history (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_server_history_offline_events
    ON server_history (server_id, timestamp DESC)
    WHERE new_status = 'OFFLINE';
