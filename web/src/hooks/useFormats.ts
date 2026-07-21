import { listFormats } from '../api/formats';
import { useAsync } from './useAsync';
import type { Format } from '../api/types';

/** Busca os formatos cadastrados (`GET /formats`) uma vez por montagem. */
export function useFormats(): { formats: Format[]; loading: boolean; error: string | null } {
  const { data, loading, error } = useAsync(() => listFormats(), []);
  return { formats: data?.data ?? [], loading, error };
}
