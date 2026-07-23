import type { BaseStats, PokemonSummary } from '../api/types';
import { defensiveProfile } from './typeChart';

/**
 * Análise heurística do time montado manualmente no Team Builder. Como aqui
 * só temos espécie/tipos/base stats (sem moveset/item/EVs escolhidos), a
 * "função" de cada Pokémon é estimada a partir da distribuição de base
 * stats — não é uma análise de set específico como a dos Times prontos
 * (que usam paste real do Showdown), mas já dá um norte de como encaixar
 * cada peça e como jogar o time como um todo.
 */

export type TeamRole =
  | 'Muro / suporte defensivo'
  | 'Tanque ofensivo físico'
  | 'Tanque ofensivo especial'
  | 'Atacante físico rápido'
  | 'Atacante especial rápido'
  | 'Âncora lenta (bom pra Trick Room)'
  | 'Breaker físico'
  | 'Breaker especial'
  | 'Suporte / utilidade';

export interface PokemonAnalysis {
  pokemon: PokemonSummary;
  role: TeamRole;
  blurb: string;
}

export interface TeamAnalysis {
  perPokemon: PokemonAnalysis[];
  archetype: string;
  battlePlan: string;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function listTypes(types: string[]): string {
  const named = types.map(capitalize);
  if (named.length <= 1) return named.join('');
  return `${named.slice(0, -1).join(', ')} e ${named[named.length - 1]}`;
}

function classifyRole(stats: BaseStats): { role: TeamRole; bulk: number; offenseMax: number; isPhysical: boolean } {
  const { hp, atk, def, spa, spd, spe } = stats;
  const bulk = (hp + def + spd) / 3;
  const offenseMax = Math.max(atk, spa);
  const isPhysical = atk >= spa;

  let role: TeamRole;
  if (bulk >= 85 && offenseMax < 90) {
    role = 'Muro / suporte defensivo';
  } else if (bulk >= 80 && offenseMax >= 90) {
    role = isPhysical ? 'Tanque ofensivo físico' : 'Tanque ofensivo especial';
  } else if (spe >= 95 && offenseMax >= 95) {
    role = isPhysical ? 'Atacante físico rápido' : 'Atacante especial rápido';
  } else if (spe <= 55 && bulk >= 70) {
    role = 'Âncora lenta (bom pra Trick Room)';
  } else if (offenseMax >= 100) {
    role = isPhysical ? 'Breaker físico' : 'Breaker especial';
  } else {
    role = 'Suporte / utilidade';
  }

  return { role, bulk, offenseMax, isPhysical };
}

function speedNote(spe: number): string {
  if (spe >= 100) return 'velocidade alta — tende a agir antes da maioria dos times, boa pra abrir ou limpar o fim de jogo';
  if (spe <= 55) return 'velocidade baixa — melhor aproveitado sob Trick Room ou como âncora que aguenta hits e devolve';
  return 'velocidade mediana — some com prioridade, Tailwind ou trocas pra entrar no momento certo';
}

function matchupNote(types: string[]): string {
  const profile = defensiveProfile(types);
  const parts: string[] = [];
  if (profile.doubleWeaknesses.length) parts.push(`toma MUITO dano (4x) de ${listTypes(profile.doubleWeaknesses)}`);
  if (profile.weaknesses.length) parts.push(`é fraco a ${listTypes(profile.weaknesses)}`);
  if (profile.immunities.length) parts.push(`é imune a ${listTypes(profile.immunities)}`);
  if (profile.doubleResistances.length) parts.push(`resiste muito bem a ${listTypes(profile.doubleResistances)}`);
  if (parts.length === 0) return 'não tem nenhum matchup defensivo extremo — perfil neutro na maioria das trocas';
  return parts.join('; ');
}

function analyzePokemon(pokemon: PokemonSummary): PokemonAnalysis {
  const { role } = classifyRole(pokemon.baseStats);
  const blurb =
    `Tem ${speedNote(pokemon.baseStats.spe)}. ` +
    `Na defesa, ${matchupNote(pokemon.types)}.`;
  return { pokemon, role, blurb };
}

export function analyzeTeam(
  team: PokemonSummary[],
  covered: string[],
  uncovered: string[],
  defensiveCounts: Record<string, { weak: number; resist: number; immune: number }>,
): TeamAnalysis {
  const perPokemon = team.map(analyzePokemon);

  if (team.length === 0) {
    return { perPokemon: [], archetype: '', battlePlan: '' };
  }

  const avgSpeed = team.reduce((sum, p) => sum + p.baseStats.spe, 0) / team.length;
  const offensiveCount = perPokemon.filter((a) => a.role.includes('Atacante') || a.role.includes('Breaker')).length;
  const defensiveCount = perPokemon.filter((a) => a.role.includes('Muro') || a.role.includes('Âncora')).length;

  let archetype: string;
  if (avgSpeed <= 65 && defensiveCount + perPokemon.filter((a) => a.role.includes('Âncora')).length >= 2) {
    archetype = 'Trick Room / controle de velocidade invertido';
  } else if (avgSpeed >= 95 && offensiveCount >= Math.ceil(team.length / 2)) {
    archetype = 'Ofensivo (hyper offense)';
  } else if (defensiveCount >= Math.ceil(team.length / 2)) {
    archetype = 'Defensivo / balance pesado';
  } else {
    archetype = 'Equilibrado (balance)';
  }

  const majorityThreshold = Math.max(2, Math.ceil(team.length / 2));
  const sharedWeaknesses = Object.entries(defensiveCounts)
    .filter(([, c]) => c.weak >= majorityThreshold)
    .map(([t]) => t);

  const fastest = [...team].sort((a, b) => b.baseStats.spe - a.baseStats.spe)[0];
  const bulkiest = [...team].sort((a, b) => {
    const bulkA = a.baseStats.hp + a.baseStats.def + a.baseStats.spd;
    const bulkB = b.baseStats.hp + b.baseStats.def + b.baseStats.spd;
    return bulkB - bulkA;
  })[0];

  const planParts: string[] = [];
  planParts.push(`O time tem cara de time ${archetype.toLowerCase()}.`);

  if (archetype.startsWith('Trick Room')) {
    planParts.push(
      `A ideia é levar hit e aguentar até plantar Trick Room, deixando os mais lentos agirem primeiro — ${bulkiest.displayName} aguenta bem o início do jogo enquanto o time procura a abertura.`,
    );
  } else if (archetype.startsWith('Ofensivo')) {
    planParts.push(
      `${fastest.displayName} (o mais rápido do time) tende a liderar ou entrar cedo pra pressionar antes do rival organizar a defesa; guarde os mais lentos pra limpar o que sobrar.`,
    );
  } else if (archetype.startsWith('Defensivo')) {
    planParts.push(
      `${bulkiest.displayName} segura a linha de frente enquanto o resto do time desgasta o rival aos poucos — jogo mais longo, ganhando pelo acúmulo de vantagem.`,
    );
  } else {
    planParts.push(
      `Sem um plano único óbvio — use ${bulkiest.displayName} pra absorver o primeiro golpe e ${fastest.displayName} pra puxar o ritmo quando a brecha aparecer.`,
    );
  }

  if (uncovered.length > 0 && uncovered.length <= 6) {
    planParts.push(`Cobertura ofensiva: o time não acerta super efetivo em ${listTypes(uncovered)} — fique de olho em Pokémon desses tipos que só se seguram por resistência de tipo.`);
  } else if (covered.length >= 14) {
    planParts.push('Cobertura ofensiva ampla — o time acerta super efetivo na maioria dos tipos.');
  }

  if (sharedWeaknesses.length > 0) {
    planParts.push(
      `Ponto fraco coletivo: mais da metade do time é vulnerável a ataques de ${listTypes(sharedWeaknesses)} — evite deixar dois desses de fora ao mesmo tempo contra times que exploram isso.`,
    );
  }

  return { perPokemon, archetype, battlePlan: planParts.join(' ') };
}
