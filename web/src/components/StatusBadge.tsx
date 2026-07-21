export type CheckStatus = 'idle' | 'loading' | 'ok' | 'error';

const labels: Record<CheckStatus, string> = {
  idle: 'Não testado',
  loading: 'Testando…',
  ok: 'OK',
  error: 'Falhou',
};

const classNames: Record<CheckStatus, string> = {
  idle: 'pending',
  loading: 'warning',
  ok: 'ok',
  error: 'error',
};

/** Selo de status usado nos cards de diagnóstico (`SystemCheckPage`). */
export function StatusBadge({ status }: { status: CheckStatus }) {
  return <span className={`badge ${classNames[status]}`}>{labels[status]}</span>;
}
