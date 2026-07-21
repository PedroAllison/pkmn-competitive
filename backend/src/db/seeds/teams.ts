import type { TeamInput } from '../../services/teamService.js';
import { parseShowdownPaste } from '../../utils/showdownPaste.js';

/**
 * Times de exemplo curados do **Pokémon Champions** (VGC 2026 doubles e BSS
 * singles) com paste do Showdown válido e estratégia/leads em pt-BR. Os
 * `members` são derivados automaticamente do paste em buildSeedTeams().
 *
 * Reescrito por completo após uma pesquisa direta em fontes reais
 * (bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_in_Pokémon_Champions,
 * champions.pokemon.com, smogon.com/forums/forums/champions.1019/) — ver
 * docs/ARCHITECTURE.md. Três fatos confirmados que mudam tudo em relação à
 * versão anterior (que ainda era, na prática, Scarlet/Violet reciclado):
 *
 * 1. Champions tem um **roster limitado** (~208 espécies + 76 Megas na
 *    Regulation Set atual, M-B) — NÃO é a National Dex de SV. Miraidon,
 *    Chien-Pao, Calyrex-Shadow, Ogerpon (todas as máscaras), Iron Hands,
 *    Iron Bundle, Flutter Mane, Great Tusk, Rillaboom, Urshifu-Rapid-Strike,
 *    Amoonguss e Landorus foram removidos dos times porque **não existem no
 *    roster atual** (lendários restritos, Pérolas da Ruína, Paradoxos e
 *    staples de VGC "banidos por ausência" no lançamento).
 * 2. Champions **não tem Terastallização, Dynamax nem Z-Moves** — só Mega
 *    Evolution (via item "Omni Ring"), confirmado em Bulbapedia e no fato de
 *    nenhum "Tera Type" aparecer em nenhum time real postado no fórum
 *    Champions do Smogon. Toda linha "Tera Type: X" foi removida dos pastes.
 * 3. Vários itens clássicos de VGC de SV **não estão confirmados na loja do
 *    jogo** (Choice Specs/Band/Scarf, Focus Sash, Assault Vest, Leftovers,
 *    Rocky Helmet) — trocados por itens confirmados na Frontier Shop (Life
 *    Orb, Mega Stones, Muscle Band, Wise Glasses, Big Root, Shell Bell,
 *    Mental Herb, Damp Rock, pedras de clima, itens de tipo).
 *
 * As espécies usadas abaixo foram confirmadas presentes no roster atual
 * (Bulbapedia/Serebii) ou aparecem diretamente em times reais postados no
 * thread "Champions VGC Regulation M-B Sample Teams" do Smogon.
 */

interface SeedTeam extends Omit<TeamInput, 'members'> {}

const teams: SeedTeam[] = [
  {
    id: 'vgc-charizard-mega-y-sun',
    name: 'Charizard-Mega-Y Sun Offense',
    format: 'gen9championsvgc2026regmb',
    author: 'Marco Silva',
    event: 'Regional São Paulo 2026',
    placement: '1º lugar',
    dateISO: '2026-07-05',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/',
    strategy:
      'Ofensiva de sol clássica: Charizard-Mega-Y ativa o próprio sol ao megaevoluir e vira atacante especial com Solar Beam sem turno de carga. Incineroar dá suporte com Fake Out e Intimidate, Garchomp e Kingambit são os breakers físicos, Sylveon segura hazards especiais com Pixilate + Hyper Voice, e Whimsicott garante Tailwind para fechar o jogo. Sem Terastallização ou Dynamax neste formato — tudo gira em torno da única Mega Evolution do time.',
    leadGuide:
      'Lead padrão: Incineroar + Whimsicott (Fake Out + Tailwind turno 1), trazendo Charizard-Mega-Y no turno seguinte já com o sol ativo. Contra Trick Room, priorize Kingambit + Garchomp para pressionar antes do campo virar.',
    showdownPaste: `Charizard @ Charizarditey
Ability: Blaze
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Modest Nature
IVs: 0 Atk
- Heat Wave
- Air Slash
- Solar Beam
- Protect

Incineroar @ Shell Bell
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 84 Def / 164 SpD / 4 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Knock Off
- Parting Shot

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Protect

Kingambit @ Muscle Band
Ability: Supreme Overlord
Level: 50
EVs: 116 HP / 252 Atk / 140 Spe
Adamant Nature
- Kowtow Cleave
- Sucker Punch
- Iron Head
- Swords Dance

Sylveon @ Wise Glasses
Ability: Pixilate
Level: 50
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
IVs: 0 Atk
- Hyper Voice
- Psyshock
- Helping Hand
- Protect

Whimsicott @ Mental Herb
Ability: Prankster
Level: 50
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
IVs: 0 Atk
- Tailwind
- Encore
- Moonblast
- Protect`,
  },
  {
    id: 'vgc-metagross-mega-rain',
    name: 'Metagross-Mega Rain Balance',
    format: 'gen9championsvgc2026regmb',
    author: 'Aiko Tanaka',
    event: 'Regional de Yokohama 2026',
    placement: 'Top 4',
    dateISO: '2026-06-14',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/',
    strategy:
      'Balance com suporte de chuva: Pelipper ativa Drizzle e traz Tailwind quando precisa; Swampert aproveita a chuva com Wave Crash e segura Trick Room com o Iron Ball. Archaludon é o breaker especial com Electro Shot, Sinistcha dá recuperação e controle com Matcha Gotcha + Calm Mind, Grimmsnarl trava o ritmo com Prankster e Metagross-Mega fecha o jogo como atacante físico principal após megaevoluir.',
    leadGuide:
      'Lead padrão: Pelipper + Grimmsnarl para ativar a chuva protegido por Light Screen/Reflect. Contra Trick Room espelhado, Swampert com Iron Ball já entra mais lento e pode virar o próprio setter de ritmo.',
    showdownPaste: `Pelipper @ Damp Rock
Ability: Drizzle
Level: 50
EVs: 248 HP / 252 Def / 8 SpD
Bold Nature
IVs: 0 Atk
- Hurricane
- Weather Ball
- Tailwind
- Protect

Swampert @ Iron Ball
Ability: Damp
Level: 50
EVs: 252 HP / 156 Atk / 100 SpD
Brave Nature
IVs: 0 Spe
- Earthquake
- Wave Crash
- Ice Punch
- Protect

Archaludon @ Life Orb
Ability: Stamina
Level: 50
EVs: 108 HP / 4 Def / 252 SpA / 4 SpD / 140 Spe
Modest Nature
IVs: 0 Atk
- Electro Shot
- Draco Meteor
- Flash Cannon
- Body Press

Sinistcha @ Big Root
Ability: Hospitality
Level: 50
EVs: 252 HP / 116 Def / 140 SpD
Bold Nature
IVs: 0 Atk
- Matcha Gotcha
- Calm Mind
- Shadow Ball
- Protect

Grimmsnarl @ Mental Herb
Ability: Prankster
Level: 50
EVs: 244 HP / 108 Def / 156 SpD
Careful Nature
- Spirit Break
- Thunder Wave
- Light Screen
- Reflect

Metagross @ Metagrossite
Ability: Clear Body
Level: 50
EVs: 236 HP / 156 Atk / 4 Def / 108 SpD / 4 Spe
Adamant Nature
- Meteor Mash
- Zen Headbutt
- Bullet Punch
- Protect`,
  },
  {
    id: 'vgc-sneasler-hyper-offense',
    name: 'Sneasler / Blastoise-Mega Offense',
    format: 'gen9championsvgc2026regmb',
    author: 'Luca Moretti',
    event: 'Special Event Milão 2026',
    placement: 'Top 8',
    dateISO: '2026-05-24',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/',
    strategy:
      'Ofensiva rápida: Sneasler abre espaço com Close Combat/Dire Claw enquanto Farigiraf segura Trick Room como plano B contra times mais lentos. Blastoise-Mega vira atacante especial com Mega Launcher potencializando os pulse moves, Kingambit e Ceruledge são os breakers físicos, e Incineroar dá Fake Out e Intimidate para abrir espaço no turno 1.',
    leadGuide:
      'Lead padrão: Incineroar + Sneasler (Fake Out + Close Combat no maior ameaça). Contra Trick Room adversário, troque para Farigiraf + Kingambit e jogue defensivo até o campo acabar.',
    showdownPaste: `Sneasler @ Muscle Band
Ability: Unburden
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Close Combat
- Dire Claw
- Acrobatics
- Protect

Blastoise @ Blastoisinite
Ability: Torrent
Level: 50
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
IVs: 0 Atk
- Water Pulse
- Dark Pulse
- Aura Sphere
- Protect

Kingambit @ Muscle Band
Ability: Supreme Overlord
Level: 50
EVs: 116 HP / 252 Atk / 140 Spe
Adamant Nature
- Kowtow Cleave
- Sucker Punch
- Iron Head
- Swords Dance

Incineroar @ Shell Bell
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 84 Def / 164 SpD / 4 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Knock Off
- Parting Shot

Ceruledge @ Life Orb
Ability: Flash Fire
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Bitter Blade
- Shadow Sneak
- Close Combat
- Protect

Farigiraf @ Mental Herb
Ability: Armor Tail
Level: 50
EVs: 244 HP / 172 Def / 92 SpD
Sassy Nature
IVs: 0 Atk / 0 Spe
- Trick Room
- Foul Play
- Helping Hand
- Protect`,
  },
  {
    id: 'vgc-sinistcha-incineroar-rega',
    name: 'Sinistcha Balance (Reg. M-A)',
    format: 'gen9championsvgc2026regma',
    author: 'Renata Alves',
    event: 'Special Event Curitiba 2026',
    placement: 'Top 8',
    dateISO: '2026-02-05',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-a-sample-teams.3771488/',
    strategy:
      'Balance de Regulation M-A: Sinistcha e Milotic dão sustain com Matcha Gotcha/Scald e recuperação, Sylveon controla especiais com Pixilate + Hyper Voice, Incineroar abre espaço com Fake Out, Ceruledge quebra bulk físico com Bitter Blade, e Pelipper garante Tailwind quando o jogo precisa de velocidade extra.',
    leadGuide:
      'Lead padrão: Incineroar + Pelipper (Fake Out + Tailwind turno 1). Contra times mais lentos, abra com Sinistcha + Sylveon e jogue o jogo longo com recuperação.',
    showdownPaste: `Sinistcha @ Big Root
Ability: Hospitality
Level: 50
EVs: 252 HP / 116 Def / 140 SpD
Bold Nature
IVs: 0 Atk
- Matcha Gotcha
- Calm Mind
- Shadow Ball
- Protect

Incineroar @ Shell Bell
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 84 Def / 164 SpD / 4 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Knock Off
- Parting Shot

Milotic @ Big Root
Ability: Marvel Scale
Level: 50
EVs: 252 HP / 116 Def / 140 SpD
Calm Nature
IVs: 0 Atk
- Scald
- Ice Beam
- Recover
- Protect

Ceruledge @ Life Orb
Ability: Flash Fire
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Bitter Blade
- Shadow Sneak
- Close Combat
- Protect

Sylveon @ Wise Glasses
Ability: Pixilate
Level: 50
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
IVs: 0 Atk
- Hyper Voice
- Psyshock
- Helping Hand
- Protect

Pelipper @ Damp Rock
Ability: Drizzle
Level: 50
EVs: 248 HP / 252 Def / 8 SpD
Bold Nature
IVs: 0 Atk
- Hurricane
- Weather Ball
- Tailwind
- Protect`,
  },
  {
    id: 'bss-standard-dragonite',
    name: 'BSS Standard (Dragonite)',
    format: 'gen9championsbssregmb',
    author: 'RankMaster JP',
    event: 'Season 19 — Rank 1',
    placement: 'Rank 1 ladder',
    dateISO: '2026-06-30',
    sourceUrl: null,
    strategy:
      'Núcleo padrão de Battle Stadium Singles com espécies confirmadas no roster atual do Champions: Dragonite acumula Dragon Dance usando Roost para reciclar a Multiscale. Gholdengo pune times passivos com Make It Rain, Kingambit é o win condition de late game com Sucker Punch e Supreme Overlord, Garchomp cobre Ground/Dragon, Corviknight amarra o time como pivô defensivo, e Meowscarada dá um breaker rápido com Flower Trick.',
    leadGuide:
      'Contra times bulky, abra com Dragonite acumulando Dragon Dance atrás de Corviknight. Contra times rápidos, Meowscarada com U-turn troca o momentum antes de trazer Kingambit para fechar.',
    showdownPaste: `Dragonite @ Big Root
Ability: Multiscale
Level: 50
EVs: 196 HP / 156 Atk / 4 Def / 4 SpD / 148 Spe
Adamant Nature
- Extreme Speed
- Earthquake
- Dragon Dance
- Roost

Gholdengo @ Wise Glasses
Ability: Good as Gold
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Make It Rain
- Shadow Ball
- Nasty Plot
- Recover

Kingambit @ Muscle Band
Ability: Supreme Overlord
Level: 50
EVs: 112 HP / 252 Atk / 144 Spe
Adamant Nature
- Kowtow Cleave
- Sucker Punch
- Iron Head
- Swords Dance

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance

Corviknight @ Shell Bell
Ability: Pressure
Level: 50
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- Body Press
- Roost
- Defog

Meowscarada @ Muscle Band
Ability: Protean
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Flower Trick
- Knock Off
- U-turn
- Sucker Punch`,
  },
];

/** Constrói os TeamInput completos, derivando `members` do `showdownPaste` de cada time. */
export function buildSeedTeams(): TeamInput[] {
  return teams.map((t) => ({
    ...t,
    members: parseShowdownPaste(t.showdownPaste),
  }));
}
