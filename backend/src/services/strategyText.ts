import { toShowdownId } from '../utils/format.js';
import type { NamedPct, Spread } from '../types/contract.js';

/**
 * Gerador determinístico de texto de estratégia em pt-BR a partir dos usage
 * stats (sem IA externa). Infere papel (sweeper/atacante físico ou especial,
 * pivô defensivo, suporte), comenta o item mais comum, o spread dominante,
 * os golpes mais frequentes e o Tera mais popular.
 */

export interface StrategyInput {
  displayName: string;
  spreads: Spread[];
  items: NamedPct[];
  moves: NamedPct[];
  teraTypes: NamedPct[];
  abilities: NamedPct[];
}

const SETUP_MOVES = new Set([
  'swordsdance',
  'nastyplot',
  'calmmind',
  'dragondance',
  'bulkup',
  'shellsmash',
  'quiverdance',
  'shiftgear',
  'bellydrum',
  'victorydance',
]);

const ITEM_PHRASES: Record<string, string> = {
  choiceband: 'com Choice Band para maximizar o dano imediato',
  choicespecs: 'com Choice Specs para maximizar o dano especial imediato',
  choicescarf: 'com Choice Scarf para surpreender em velocidade',
  leftovers: 'com Leftovers para ganhar longevidade',
  heavydutyboots: 'com Heavy-Duty Boots para entrar livre de hazards',
  assaultvest: 'com Assault Vest para tankar ataques especiais',
  focussash: 'com Focus Sash para garantir uma ação',
  lifeorb: 'com Life Orb para ampliar o dano sem travar em um golpe',
  boosterenergy: 'com Booster Energy para ativar seu boost imediatamente',
  rockyhelmet: 'com Rocky Helmet para punir contato',
  sitrusberry: 'com Sitrus Berry para sustain em Doubles',
};

function formatEvs(s: Spread): string {
  const parts: string[] = [];
  const labels: [keyof Spread['evs'], string][] = [
    ['hp', 'HP'],
    ['atk', 'Atk'],
    ['def', 'Def'],
    ['spa', 'SpA'],
    ['spd', 'SpD'],
    ['spe', 'Spe'],
  ];
  for (const [key, label] of labels) {
    if (s.evs[key] > 0) parts.push(`${s.evs[key]} ${label}`);
  }
  return parts.join(' / ');
}

function inferRole(input: StrategyInput): string {
  const s = input.spreads[0];
  const hasSetup = input.moves.some((m) => SETUP_MOVES.has(toShowdownId(m.name)) && m.pct >= 20);
  const attackerNoun = hasSetup ? 'sweeper' : 'atacante';

  const physical = s.evs.atk >= 200 && s.evs.atk >= s.evs.spa;
  const special = s.evs.spa >= 200 && s.evs.spa > s.evs.atk;
  const bulky = s.evs.hp >= 200;

  if (physical && bulky) return `${attackerNoun} físico bulky`;
  if (special && bulky) return `${attackerNoun} especial bulky`;
  if (physical) return `${attackerNoun} físico`;
  if (special) return `${attackerNoun} especial`;
  if (bulky && s.evs.def >= s.evs.spd) return 'pivô defensivo (wall física)';
  if (bulky) return 'pivô defensivo (wall especial)';
  return 'suporte utilitário';
}

function itemPhrase(items: NamedPct[]): string {
  const top = items[0];
  if (!top || top.pct < 30) return '';
  const phrase = ITEM_PHRASES[toShowdownId(top.name)];
  return phrase ? `, ${phrase}` : `, geralmente equipado com ${top.name}`;
}

function listMoves(moves: NamedPct[]): string {
  const names = moves.slice(0, 4).map((m) => m.name);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

/**
 * Gera o texto de estratégia; retorna `null` quando não há dados suficientes
 * (sem spreads ou sem moves).
 */
export function generateStrategyText(input: StrategyInput): string | null {
  if (input.spreads.length === 0 || input.moves.length === 0) return null;

  const role = inferRole(input);
  const topSpread = input.spreads[0];
  const sentences: string[] = [];

  sentences.push(`${input.displayName} é geralmente usado como ${role}${itemPhrase(input.items)}.`);
  sentences.push(`Os golpes mais frequentes são ${listMoves(input.moves)}.`);
  sentences.push(
    `O spread mais comum é ${topSpread.nature} com ${formatEvs(topSpread)} (${topSpread.pct}% dos sets).`,
  );

  const topTera = input.teraTypes[0];
  if (topTera && topTera.pct >= 20) {
    sentences.push(`Tera ${topTera.name} é a escolha mais popular (${topTera.pct}%).`);
  }

  const topAbility = input.abilities[0];
  if (topAbility && topAbility.pct >= 50) {
    sentences.push(`A habilidade padrão é ${topAbility.name}.`);
  }

  return sentences.join(' ');
}
