import { describe, expect, it } from 'vitest';
import { generateStrategyText, type StrategyInput } from '../src/services/strategyText.js';

const base: StrategyInput = {
  displayName: 'Kingambit',
  spreads: [],
  items: [],
  moves: [],
  teraTypes: [],
  abilities: [],
};

describe('generateStrategyText', () => {
  it('retorna null sem dados suficientes', () => {
    expect(generateStrategyText(base)).toBeNull();
    expect(
      generateStrategyText({
        ...base,
        spreads: [{ nature: 'Jolly', evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, pct: 50 }],
      }),
    ).toBeNull(); // sem moves
  });

  it('descreve sweeper físico com Choice Band e setup', () => {
    const text = generateStrategyText({
      ...base,
      spreads: [
        { nature: 'Adamant', evs: { hp: 112, atk: 252, def: 0, spa: 0, spd: 0, spe: 144 }, pct: 45.5 },
      ],
      items: [{ name: 'Choice Band', pct: 48 }],
      moves: [
        { name: 'Kowtow Cleave', pct: 95 },
        { name: 'Sucker Punch', pct: 90 },
        { name: 'Iron Head', pct: 70 },
        { name: 'Swords Dance', pct: 35 },
      ],
      teraTypes: [{ name: 'Fairy', pct: 41 }],
      abilities: [{ name: 'Supreme Overlord', pct: 99 }],
    });
    expect(text).not.toBeNull();
    expect(text).toContain('sweeper físico');
    expect(text).toContain('Choice Band');
    expect(text).toContain('Kowtow Cleave');
    expect(text).toContain('Adamant');
    expect(text).toContain('252 Atk');
    expect(text).toContain('Tera Fairy');
    expect(text).toContain('Supreme Overlord');
  });

  it('descreve wall especial defensiva', () => {
    const text = generateStrategyText({
      ...base,
      displayName: 'Blissey',
      spreads: [
        { nature: 'Calm', evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 }, pct: 62 },
      ],
      items: [{ name: 'Heavy-Duty Boots', pct: 70 }],
      moves: [
        { name: 'Seismic Toss', pct: 85 },
        { name: 'Soft-Boiled', pct: 92 },
      ],
    });
    expect(text).toContain('pivô defensivo');
    expect(text).toContain('wall especial');
    expect(text).toContain('Heavy-Duty Boots');
  });

  it('é determinístico', () => {
    const input: StrategyInput = {
      ...base,
      spreads: [
        { nature: 'Timid', evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 }, pct: 55 },
      ],
      items: [{ name: 'Choice Specs', pct: 44 }],
      moves: [
        { name: 'Shadow Ball', pct: 88 },
        { name: 'Make It Rain', pct: 97 },
      ],
    };
    expect(generateStrategyText(input)).toBe(generateStrategyText(input));
    expect(generateStrategyText(input)).toContain('atacante especial');
  });
});
