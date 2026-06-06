-- MicroCheck - Datos demo iniciales
-- DBA: Leonardo Falconí

INSERT INTO servers (name, url, status) VALUES
    ('HTTPBin OK', 'https://httpbin.org/status/200', 'UNKNOWN'),
    ('Example.com', 'https://example.com', 'UNKNOWN'),
    ('Google', 'https://www.google.com', 'UNKNOWN')
ON CONFLICT (url) DO NOTHING;
