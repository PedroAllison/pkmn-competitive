/** Erro HTTP tipado, convertido pelo error handler no envelope `{ error }` do contrato. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (message: string): HttpError => new HttpError(404, 'NOT_FOUND', message);
export const badRequest = (message: string): HttpError =>
  new HttpError(400, 'VALIDATION_ERROR', message);
export const unauthorized = (message: string): HttpError =>
  new HttpError(401, 'UNAUTHORIZED', message);
export const upstreamError = (message: string): HttpError =>
  new HttpError(502, 'UPSTREAM_ERROR', message);
