-- Registro de execução dos jobs de sincronização
CREATE TABLE sync_log (
  id          bigserial PRIMARY KEY,
  job         text NOT NULL,
  status      text NOT NULL CHECK (status IN ('running', 'success', 'error')),
  message     text,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX idx_sync_log_job_started ON sync_log (job, started_at DESC);
