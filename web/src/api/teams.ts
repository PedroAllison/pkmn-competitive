import { apiGet } from './client';
import type { TeamSummary } from './types';

export interface TeamDetail extends TeamSummary {
  showdownPaste: string;
  strategy: string | null;
  leadGuide: string | null;
  sourceUrl: string | null;
}

export async function listTeams(params: { format?: string; page?: number; limit?: number }) {
  return apiGet<TeamSummary[]>('/teams', params);
}

export async function getTeam(id: string) {
  return apiGet<TeamDetail>(`/teams/${encodeURIComponent(id)}`);
}
