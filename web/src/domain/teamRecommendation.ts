/**
 * Motor de recomendação de time do Team Builder ("Recomendar um time pra
 * mim"). Em vez de tentar inferir estilo de jogo a partir do paste (frágil),
 * cada time do catálogo recebe um pequeno perfil (`TEAM_PROFILES`) com as
 * características relevantes para o quiz — offense/defesa, controle de
 * velocidade, formato (duplas/simples), clima e presença de Mega Evolution
 * como carro-chefe. Esses perfis foram definidos manualmente a partir da
 * estratégia de cada time (ver `backend/src/db/seeds/teams.ts`).
 *
 * O quiz pergunta sobre o perfil do treinador e pontua cada time do formato
 * elegível; o de maior pontuação é recomendado, usando `strategy`/`leadGuide`
 * (já existentes no contrato de Times) como a explicação de "por que esse
 * time" e "como jogar com ele".
 */

export type Offense = 'offense' | 'balance' | 'defense';
export type SpeedControl = 'fast' | 'trickroom' | 'balanced';
export type Weather = 'rain' | 'sun' | 'sand' | 'snow' | null;

export interface TeamProfile {
  offense: Offense;
  speed: SpeedControl;
  doubles: boolean;
  weather: Weather;
  megaFocus: boolean;
}

/** Perfil manual de cada time seed — chave é o `id` do time. */
export const TEAM_PROFILES: Record<string, TeamProfile> = {
  'vgc-charizard-mega-y-sun': { offense: 'offense', speed: 'fast', doubles: true, weather: 'sun', megaFocus: true },
  'vgc-metagross-mega-rain': { offense: 'balance', speed: 'balanced', doubles: true, weather: 'rain', megaFocus: true },
  'vgc-sneasler-hyper-offense': { offense: 'offense', speed: 'fast', doubles: true, weather: null, megaFocus: true },
  'vgc-sinistcha-incineroar-rega': { offense: 'balance', speed: 'balanced', doubles: true, weather: 'rain', megaFocus: false },
  'bss-standard-dragonite': { offense: 'balance', speed: 'balanced', doubles: false, weather: null, megaFocus: false },
  'vgc-aerodactyl-mega-speed-control': { offense: 'offense', speed: 'fast', doubles: true, weather: null, megaFocus: true },
  'vgc-venusaur-sun-balance': { offense: 'balance', speed: 'balanced', doubles: true, weather: 'sun', megaFocus: true },
  'vgc-sableye-rain-rega': { offense: 'defense', speed: 'balanced', doubles: true, weather: 'rain', megaFocus: false },
  'vgc-aerodactyl-venusaur-mega-rega': { offense: 'offense', speed: 'fast', doubles: true, weather: null, megaFocus: true },
  'vgc-ninetales-alola-balance-rega': { offense: 'balance', speed: 'balanced', doubles: true, weather: 'snow', megaFocus: false },
  'bss-meowscarada-balance': { offense: 'offense', speed: 'fast', doubles: false, weather: null, megaFocus: false },
  'bss-lopunny-mega-balance': { offense: 'balance', speed: 'balanced', doubles: false, weather: null, megaFocus: true },
  'bss-core-four-rega': { offense: 'defense', speed: 'trickroom', doubles: false, weather: 'sand', megaFocus: false },
  'ou-corviknight-slowking-balance': { offense: 'defense', speed: 'trickroom', doubles: false, weather: null, megaFocus: false },
  'ou-lopunny-mega-balance': { offense: 'balance', speed: 'balanced', doubles: false, weather: null, megaFocus: true },
  'ou-rain-pelipper-archaludon': { offense: 'balance', speed: 'balanced', doubles: false, weather: 'rain', megaFocus: true },
  'uu-4v4-doubles-balance': { offense: 'balance', speed: 'balanced', doubles: true, weather: null, megaFocus: false },
};

export interface QuizAnswers {
  offense: Offense | 'any';
  speed: SpeedControl | 'any';
  format: 'doubles' | 'singles' | 'any';
  weather: 'rain' | 'sun' | 'sandsnow' | 'none' | 'any';
  mega: 'yes' | 'any';
}

const OFFENSE_RANK: Record<Offense, number> = { offense: 3, balance: 2, defense: 1 };

/** Pontua um time contra as respostas do quiz — maior pontuação = melhor match. */
export function scoreTeam(profile: TeamProfile, answers: QuizAnswers): number {
  let score = 0;

  if (answers.offense !== 'any') {
    score += 3 - Math.abs(OFFENSE_RANK[profile.offense] - OFFENSE_RANK[answers.offense]);
  }

  if (answers.speed !== 'any') {
    score += profile.speed === answers.speed ? 2 : 0;
  } else {
    score += 1;
  }

  if (answers.format !== 'any') {
    const wantsDoubles = answers.format === 'doubles';
    score += profile.doubles === wantsDoubles ? 3 : -3;
  }

  if (answers.weather !== 'any') {
    if (answers.weather === 'none') {
      score += profile.weather ? -1 : 2;
    } else if (answers.weather === 'sandsnow') {
      score += profile.weather === 'sand' || profile.weather === 'snow' ? 2 : 0;
    } else {
      score += profile.weather === answers.weather ? 2 : 0;
    }
  }

  if (answers.mega === 'yes') {
    score += profile.megaFocus ? 2 : 0;
  }

  return score;
}

/** Recomenda o(s) melhor(es) time(s) dentre os ids conhecidos, do maior para o menor score. */
export function rankTeams(teamIds: string[], answers: QuizAnswers): { id: string; score: number }[] {
  return teamIds
    .filter((id) => TEAM_PROFILES[id])
    .map((id) => ({ id, score: scoreTeam(TEAM_PROFILES[id], answers) }))
    .sort((a, b) => b.score - a.score);
}
