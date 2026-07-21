/**
 * Executa `fn` sobre `items` com no máximo `limit` promessas simultâneas.
 * Erros individuais não abortam o lote — são retornados como `null` e
 * reportados via callback opcional.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  onError?: (item: T, err: unknown) => void,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]);
      } catch (err) {
        onError?.(items[i], err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Sleep assíncrono. */
export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
