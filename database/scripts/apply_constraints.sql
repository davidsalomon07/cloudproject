-- MicroCheck - Aplicar constraints en volúmenes legacy (sin FK/índices)
-- DBA: Leonardo Falconí
-- Uso: psql -U postgres -d monitoring -f apply_constraints.sql
-- Idempotente: puede ejecutarse múltiples veces sin error.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_servers_url'
    ) THEN
        ALTER TABLE servers ADD CONSTRAINT uq_servers_url UNIQUE (url);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_servers_status'
    ) THEN
        ALTER TABLE servers ADD CONSTRAINT chk_servers_status
            CHECK (status IN ('ONLINE', 'OFFLINE', 'UNKNOWN'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_history_server'
    ) THEN
        ALTER TABLE server_history ADD CONSTRAINT fk_history_server
            FOREIGN KEY (server_id) REFERENCES servers(id)
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_history_previous_status'
    ) THEN
        ALTER TABLE server_history ADD CONSTRAINT chk_history_previous_status
            CHECK (previous_status IN ('ONLINE', 'OFFLINE', 'UNKNOWN'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_history_new_status'
    ) THEN
        ALTER TABLE server_history ADD CONSTRAINT chk_history_new_status
            CHECK (new_status IN ('ONLINE', 'OFFLINE', 'UNKNOWN'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_server_history_server_id
    ON server_history (server_id);

CREATE INDEX IF NOT EXISTS idx_server_history_timestamp_desc
    ON server_history (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_server_history_offline_events
    ON server_history (server_id, timestamp DESC)
    WHERE new_status = 'OFFLINE';
