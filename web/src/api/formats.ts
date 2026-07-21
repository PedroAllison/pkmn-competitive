import { apiGet } from './client';
import type { Format } from './types';

export async function listFormats() {
  return apiGet<Format[]>('/formats');
}
