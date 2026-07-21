/**
 * Type chart completo (18x18, Geração 6+) e utilitários de matchup —
 * lógica pura, sem dependência de React, para o Team Builder.
 */

export const CHART_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

/** Multiplicadores de dano `atacante -> defensor`; ausência = dano neutro (1x). */
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/** Multiplicador do ataque de `attackingType` contra um único `defendingType`. */
export function attackEffectiveness(attackingType: string, defendingType: string): number {
  const row = TYPE_CHART[attackingType.toLowerCase().trim()];
  if (!row) {
    return 1;
  }
  return row[defendingType.toLowerCase().trim()] ?? 1;
}

/** Multiplicador combinado do ataque contra um Pokémon com `defenderTypes` (1 ou 2 tipos). */
export function defensiveMultiplier(attackingType: string, defenderTypes: string[]): number {
  return defenderTypes.reduce((acc, t) => acc * attackEffectiveness(attackingType, t), 1);
}

export interface DefensiveProfile {
  doubleWeaknesses: string[];
  weaknesses: string[];
  resistances: string[];
  doubleResistances: string[];
  immunities: string[];
}

/** Perfil defensivo de uma combinação de tipos. */
export function defensiveProfile(types: string[]): DefensiveProfile {
  const doubleWeaknesses: string[] = [];
  const weaknesses: string[] = [];
  const resistances: string[] = [];
  const doubleResistances: string[] = [];
  const immunities: string[] = [];

  for (const attacking of CHART_TYPES) {
    const multiplier = defensiveMultiplier(attacking, types);
    if (multiplier === 0) {
      immunities.push(attacking);
    } else if (multiplier >= 4) {
      doubleWeaknesses.push(attacking);
    } else if (multiplier >= 2) {
      weaknesses.push(attacking);
    } else if (multiplier > 0 && multiplier <= 0.25) {
      doubleResistances.push(attacking);
    } else if (multiplier < 1) {
      resistances.push(attacking);
    }
  }

  return { doubleWeaknesses, weaknesses, resistances, doubleResistances, immunities };
}

/** Tipos que recebem dano super efetivo (>= 2x) de pelo menos um dos `stabTypes`. */
export function offensiveCoverage(stabTypes: string[]): string[] {
  const covered: string[] = [];
  for (const defending of CHART_TYPES) {
    if (stabTypes.some((attacking) => attackEffectiveness(attacking, defending) >= 2)) {
      covered.push(defending);
    }
  }
  return covered;
}
