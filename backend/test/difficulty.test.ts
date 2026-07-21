import { describe, expect, it } from 'vitest';
import { computeDifficulty, type DifficultyInput } from '../src/services/difficulty.js';
import type { Spread } from '../src/types/contract.js';

const spread = (nature: string, evs: Partial<Spread['evs']>, pct: number): Spread => ({
  nature,
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...evs },
  pct,
});

describe('computeDifficulty', () => {
  it('easy: um spread dominante, item passivo, sem setup', () => {
    const input: DifficultyInput = {
      spreads: [spread('Jolly', { atk: 252, spe: 252, spd: 4 }, 80)],
      items: [{ name: 'Leftovers', pct: 60 }],
      moves: [
        { name: 'Knock Off', pct: 90 },
        { name: 'U-turn', pct: 70 },
      ],
    };
    expect(computeDifficulty(input)).toBe('easy');
  });

  it('medium: vários spreads viáveis + dependência de item Choice', () => {
    const input: DifficultyInput = {
      spreads: [
        spread('Jolly', { atk: 252, spe: 252 }, 30),
        spread('Adamant', { atk: 252, spe: 252 }, 20),
        spread('Jolly', { atk: 252, spe: 200, hp: 56 }, 10),
        spread('Adamant', { atk: 252, hp: 56 }, 3), // < 5%, não conta
      ],
      items: [
        { name: 'Choice Band', pct: 35 },
        { name: 'Choice Scarf', pct: 15 },
      ],
      moves: [{ name: 'Close Combat', pct: 95 }],
    };
    expect(computeDifficulty(input)).toBe('medium');
  });

  it('hard: muitos sets, papéis mistos, Choice e setup', () => {
    const input: DifficultyInput = {
      spreads: [
        spread('Jolly', { atk: 252, spe: 252 }, 25),
        spread('Impish', { hp: 252, def: 252 }, 20),
        spread('Adamant', { atk: 252, spe: 252, def: 4 }, 15),
        spread('Careful', { hp: 252, spd: 252 }, 10),
        spread('Jolly', { atk: 252, spe: 252, hp: 4 }, 8),
      ],
      items: [
        { name: 'Choice Band', pct: 30 },
        { name: 'Choice Scarf', pct: 15 },
      ],
      moves: [
        { name: 'Swords Dance', pct: 42 },
        { name: 'Earthquake', pct: 88 },
      ],
    };
    expect(computeDifficulty(input)).toBe('hard');
  });

  it('é determinística', () => {
    const input: DifficultyInput = {
      spreads: [spread('Timid', { spa: 252, spe: 252 }, 55)],
      items: [{ name: 'Heavy-Duty Boots', pct: 40 }],
      moves: [{ name: 'Shadow Ball', pct: 80 }],
    };
    expect(computeDifficulty(input)).toBe(computeDifficulty(input));
  });
});
