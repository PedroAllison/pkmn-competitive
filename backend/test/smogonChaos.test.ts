import { describe, expect, it } from 'vitest';
import {
  parseChaosEntry,
  parseChaosFile,
  parseSpreadKey,
  type ChaosFile,
} from '../src/datasources/smogonChaos.js';

const greatTusk = {
  'Raw count': 5000,
  usage: 0.4523,
  Abilities: { protosynthesis: 1000 },
  Items: { heavydutyboots: 600, leftovers: 300, boosterenergy: 100 },
  Spreads: {
    'Jolly:0/252/0/0/4/252': 500,
    'Impish:252/0/252/0/4/0': 300,
    'Jolly:0/252/4/0/0/252': 200,
  },
  Moves: { headlongrush: 900, rapidspin: 800, knockoff: 600, icespinner: 400, '': 100 },
  Teammates: { Gholdengo: 400, Kingambit: 250, 'Bad Mon': -50 },
  'Checks and Counters': {
    Zapdos: [200, 0.85, 0.02] as [number, number, number],
    'Weezing-Galar': [50, 0.6, 0.05] as [number, number, number],
    Raro: [5, 0.9, 0.01] as [number, number, number],
  },
  'Tera Types': { Steel: 400, Fire: 300, Ground: 300 },
};

const chaosFile: ChaosFile = {
  info: { metagame: 'gen9ou', cutoff: 1760, 'number of battles': 100000 },
  data: {
    'Great Tusk': greatTusk,
    Kingambit: {
      ...greatTusk,
      usage: 0.3011,
      'Raw count': 3300,
      Teammates: {},
      'Checks and Counters': {},
    },
  },
};

describe('parseSpreadKey', () => {
  it('faz o parse de "Nature/HP/Atk/Def/SpA/SpD/Spe"', () => {
    expect(parseSpreadKey('Jolly:0/252/0/0/4/252')).toEqual({
      nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    });
  });

  it('rejeita chaves malformadas', () => {
    expect(parseSpreadKey('Jolly')).toBeNull();
    expect(parseSpreadKey('Jolly:0/252/0')).toBeNull();
    expect(parseSpreadKey('Jolly:a/b/c/d/e/f')).toBeNull();
  });
});

describe('parseChaosEntry', () => {
  const entry = parseChaosEntry('Great Tusk', greatTusk);

  it('normaliza usage e identidade', () => {
    expect(entry.name).toBe('great-tusk');
    expect(entry.displayName).toBe('Great Tusk');
    expect(entry.usagePct).toBe(45.23);
    expect(entry.rawCount).toBe(5000);
  });

  it('normaliza percentuais de itens pelo peso total (soma das abilities)', () => {
    expect(entry.items[0]).toEqual({ name: 'heavydutyboots', pct: 60 });
    expect(entry.items[1]).toEqual({ name: 'leftovers', pct: 30 });
  });

  it('normaliza spreads e agrega natures', () => {
    expect(entry.spreads[0]).toEqual({
      nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
      pct: 50,
    });
    expect(entry.spreads).toHaveLength(3);
    expect(entry.natures[0]).toEqual({ name: 'Jolly', pct: 70 });
    expect(entry.natures[1]).toEqual({ name: 'Impish', pct: 30 });
  });

  it('normaliza moves, descartando o slot vazio ""', () => {
    expect(entry.moves.map((m) => m.name)).toEqual([
      'headlongrush',
      'rapidspin',
      'knockoff',
      'icespinner',
    ]);
    expect(entry.moves[0].pct).toBe(90);
  });

  it('descarta teammates com correlação negativa e canoniza nomes', () => {
    expect(entry.teammates).toEqual([
      { name: 'gholdengo', displayName: 'Gholdengo', pct: 40 },
      { name: 'kingambit', displayName: 'Kingambit', pct: 25 },
    ]);
  });

  it('calcula score (p − 4d) e kind dos checks & counters', () => {
    expect(entry.checksAndCounters).toHaveLength(2); // "Raro" tem n < 20
    const [zapdos, weezing] = entry.checksAndCounters;
    expect(zapdos.name).toBe('zapdos');
    expect(zapdos.score).toBe(77);
    expect(zapdos.kind).toBe('counter');
    expect(zapdos.koPct + zapdos.switchPct).toBeCloseTo(85, 5);
    expect(weezing.name).toBe('weezing-galar');
    expect(weezing.score).toBe(40);
    expect(weezing.kind).toBe('check');
  });

  it('normaliza tera types', () => {
    expect(entry.teraTypes[0]).toEqual({ name: 'Steel', pct: 40 });
  });
});

describe('parseChaosFile', () => {
  it('ordena por usage e atribui rank', () => {
    const entries = parseChaosFile(chaosFile);
    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe('great-tusk');
    expect(entries[0].rank).toBe(1);
    expect(entries[1].name).toBe('kingambit');
    expect(entries[1].rank).toBe(2);
  });
});
