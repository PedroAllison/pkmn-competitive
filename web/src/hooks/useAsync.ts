import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Executa `fetcher` sempre que `deps` mudar, ignorando respostas de
 * requisições obsoletas (evita "race conditions" quando o usuário digita
 * rápido numa busca, por exemplo).
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const requestId = useRef(0);

  useEffect(() => {
    const currentId = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (requestId.current === currentId) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((cause) => {
        if (requestId.current === currentId) {
          const message =
            cause instanceof ApiError
              ? cause.message
              : cause instanceof Error
                ? cause.message
                : 'Erro desconhecido';
          setState({ data: null, loading: false, error: message });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
