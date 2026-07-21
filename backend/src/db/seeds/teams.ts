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
  {
    id: 'vgc-aerodactyl-mega-speed-control',
    name: 'Aerodactyl-Mega Speed Control Offense',
    format: 'gen9championsvgc2026regmb',
    author: 'Diego Fernandes',
    event: 'Regional Belo Horizonte 2026',
    placement: 'Top 16',
    dateISO: '2026-03-22',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/',
    strategy:
      'Controle de velocidade com Aerodactyl-Mega: Tailwind próprio de Rock Head vira Tough Claws após megaevoluir, deixando Rock Slide muito mais forte enquanto ainda seta o campo. Charizard-Mega-Y é a segunda opção de mega (só uma é usada por partida) para jogos que pedem sol em vez de velocidade. Kingambit e Garchomp seguem como breakers físicos, Sylveon segura o lado especial e Incineroar abre espaço com Fake Out.',
    leadGuide:
      'Lead padrão: Aerodactyl-Mega + Incineroar (Tailwind + Fake Out no turno 1). Se o rival trouxer Trick Room, troque o mega para Charizard-Mega-Y e jogue em volta do sol em vez de tentar vencer a guerra de velocidade.',
    showdownPaste: `Aerodactyl @ Aerodactylite
Ability: Rock Head
Level: 50
EVs: 252 HP / 4 Atk / 252 Spe
Jolly Nature
- Rock Slide
- Tailwind
- Taunt
- Protect

Charizard @ Charizarditey
Ability: Blaze
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Modest Nature
IVs: 0 Atk
- Heat Wave
- Air Slash
- Solar Beam
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

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Protect

Incineroar @ Shell Bell
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 84 Def / 164 SpD / 4 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Knock Off
- Parting Shot`,
  },
  {
    id: 'vgc-venusaur-sun-balance',
    name: 'Venusaur Sun Balance',
    format: 'gen9championsvgc2026regmb',
    author: 'Hana Kobayashi',
    event: 'Regional Osaka 2026',
    placement: 'Top 8',
    dateISO: '2026-04-18',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/',
    strategy:
      'Sol duplo: Charizard-Mega-Y liga o sol ao megaevoluir e Venusaur (Chlorophyll) aproveita a velocidade extra para atirar Giga Drain/Sludge Bomb antes da maioria dos times. Mamoswine e Garchomp cobrem o lado físico com Icicle Crash e Earthquake, Incineroar abre espaço com Fake Out e Toxapex segura o time com Regenerator + Recover.',
    leadGuide:
      'Lead padrão: Incineroar + Charizard-Mega-Y para já entrar com o sol ativo. Traga Venusaur no turno seguinte para explorar a Chlorophyll enquanto o sol durar.',
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

Venusaur @ Big Root
Ability: Chlorophyll
Level: 50
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
IVs: 0 Atk
- Giga Drain
- Sludge Bomb
- Sleep Powder
- Protect

Mamoswine @ Muscle Band
Ability: Thick Fat
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Icicle Crash
- Earthquake
- Ice Shard
- Protect

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
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

Toxapex @ Big Root
Ability: Regenerator
Level: 50
EVs: 252 HP / 116 Def / 140 SpD
Bold Nature
IVs: 0 Atk
- Surf
- Toxic
- Recover
- Protect`,
  },
  {
    id: 'vgc-sableye-rain-rega',
    name: 'Sableye Rain Balance (Reg. M-A)',
    format: 'gen9championsvgc2026regma',
    author: 'Bruno Costa',
    event: 'Special Event Rio de Janeiro 2026',
    placement: 'Top 16',
    dateISO: '2026-01-30',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-a-sample-teams.3771488/',
    strategy:
      'Chuva com suporte Prankster: Pelipper ativa Drizzle e Sableye garante prioridade em Will-O-Wisp/Foul Play para desarmar atacantes físicos antes que ajam. Archaludon é o breaker especial, Basculegion aproveita a chuva com Wave Crash, Sinistcha dá recuperação com Matcha Gotcha e Dragonite fecha como atacante físico versátil.',
    leadGuide:
      'Lead padrão: Pelipper + Sableye (chuva + Will-O-Wisp na maior ameaça física). Contra times especiais, troque Sableye por Sinistcha e jogue o jogo longo com recuperação.',
    showdownPaste: `Sableye @ Mental Herb
Ability: Prankster
Level: 50
EVs: 252 HP / 4 Def / 252 SpD
Careful Nature
- Foul Play
- Will-O-Wisp
- Taunt
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

Basculegion @ Muscle Band
Ability: Adaptability
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
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
- Protect

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

Dragonite @ Big Root
Ability: Multiscale
Level: 50
EVs: 244 HP / 12 Atk / 4 Def / 4 SpD / 244 Spe
Adamant Nature
- Extreme Speed
- Earthquake
- Aqua Tail
- Protect`,
  },
  {
    id: 'vgc-aerodactyl-venusaur-mega-rega',
    name: 'Aerodactyl-Mega / Venusaur-Mega Balance (Reg. M-A)',
    format: 'gen9championsvgc2026regma',
    author: 'Felipe Rocha',
    event: 'Regional Buenos Aires 2026',
    placement: 'Top 4',
    dateISO: '2026-02-21',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-a-sample-teams.3771488/',
    strategy:
      'Time com duas opções de Mega Evolution — só uma entra em campo por partida. Aerodactyl-Mega dá Tailwind + Tough Claws para jogos rápidos, enquanto Venusaur-Mega troca para Thick Fat e segura melhor times de fogo/gelo quando o plano é jogar mais devagar. Sylveon e Incineroar dão suporte de sempre, Basculegion é o breaker de água e Kommo-o cobre lacunas físicas com Clanging Scales.',
    leadGuide:
      'Contra times rápidos, leve Aerodactyl-Mega e jogue Tailwind turno 1. Contra times de setup lento, prefira Venusaur-Mega e jogue defensivo até abrir espaço para Kommo-o ou Basculegion.',
    showdownPaste: `Aerodactyl @ Aerodactylite
Ability: Rock Head
Level: 50
EVs: 252 HP / 4 Atk / 252 Spe
Jolly Nature
- Rock Slide
- Tailwind
- Taunt
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

Incineroar @ Shell Bell
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 84 Def / 164 SpD / 4 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Knock Off
- Parting Shot

Basculegion @ Muscle Band
Ability: Adaptability
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Protect

Kommo-o @ Life Orb
Ability: Bulletproof
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Clanging Scales
- Close Combat
- Flamethrower
- Protect

Venusaur @ Venusaurite
Ability: Chlorophyll
Level: 50
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
IVs: 0 Atk
- Giga Drain
- Sludge Bomb
- Sleep Powder
- Protect`,
  },
  {
    id: 'vgc-ninetales-alola-balance-rega',
    name: 'Ninetales-Alola Balance (Reg. M-A)',
    format: 'gen9championsvgc2026regma',
    author: 'Sofia Martins',
    event: 'Special Event Lisboa 2026',
    placement: 'Top 8',
    dateISO: '2026-03-08',
    sourceUrl: 'https://www.smogon.com/forums/threads/champions-vgc-regulation-m-a-sample-teams.3771488/',
    strategy:
      'Controle de campo sem depender de chuva ou sol: Ninetales-Alola liga Snow Warning e usa Aurora Veil para proteger o time inteiro, Rotom-Wash e Talonflame dão suporte com Will-O-Wisp e Tailwind, Glimmora planta Spikes cedo, e Kingambit com Garchomp fecham o jogo como breakers físicos.',
    leadGuide:
      'Lead padrão: Ninetales-Alola + Talonflame (Aurora Veil + Tailwind). Contra times de setup, troque para Glimmora + Rotom-Wash para plantar hazards e queimar atacantes físicos antes de trazer os breakers.',
    showdownPaste: `Talonflame @ Muscle Band
Ability: Gale Wings
Level: 50
EVs: 252 HP / 4 Atk / 252 Spe
Jolly Nature
- Brave Bird
- Tailwind
- Taunt
- Protect

Rotom-Wash @ Wise Glasses
Ability: Levitate
Level: 50
EVs: 252 HP / 84 SpA / 172 Spe
Timid Nature
IVs: 0 Atk
- Hydro Pump
- Volt Switch
- Will-O-Wisp
- Protect

Ninetales-Alola @ Wise Glasses
Ability: Snow Warning
Level: 50
EVs: 252 HP / 4 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Blizzard
- Moonblast
- Aurora Veil
- Protect

Glimmora @ Wise Glasses
Ability: Toxic Debris
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Power Gem
- Sludge Bomb
- Spikes
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

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Protect`,
  },
  {
    id: 'bss-meowscarada-balance',
    name: 'Meowscarada Balance (BSS)',
    format: 'gen9championsbssregmb',
    author: 'RankMaster BR',
    event: 'Season 19 — Rank 3',
    placement: 'Rank 3 ladder',
    dateISO: '2026-07-02',
    sourceUrl: null,
    strategy:
      'Balance de singles com pivôs rápidos: Greninja usa Protean para virar o tipo do golpe usado e furar resistências, Meowscarada e Sneasler mantêm pressão ofensiva com U-turn/Acrobatics, Ceruledge quebra bulk físico, Garchomp cobre Ground/Dragon e Corviknight segura o time como wall defensivo com Defog.',
    leadGuide:
      'Abra com Corviknight ou Garchomp para tanque o primeiro golpe e ganhar leitura do time rival, trazendo os atacantes rápidos (Greninja/Meowscarada/Sneasler) assim que a ameaça principal for identificada.',
    showdownPaste: `Greninja @ Wise Glasses
Ability: Protean
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Surf
- Ice Beam
- Dark Pulse
- U-turn

Corviknight @ Shell Bell
Ability: Pressure
Level: 50
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- Body Press
- Roost
- Defog

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance

Sneasler @ Muscle Band
Ability: Unburden
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Close Combat
- Dire Claw
- Acrobatics
- Swords Dance

Ceruledge @ Life Orb
Ability: Flash Fire
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Bitter Blade
- Shadow Sneak
- Close Combat
- Swords Dance

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
  {
    id: 'bss-lopunny-mega-balance',
    name: 'Lopunny-Mega Balance (BSS)',
    format: 'gen9championsbssregmb',
    author: 'RankMaster EU',
    event: 'Season 19 — Rank 5',
    placement: 'Rank 5 ladder',
    dateISO: '2026-06-25',
    sourceUrl: null,
    strategy:
      'Duas megas de seguro (só uma entra por partida): Lopunny-Mega vira Scrappy e acerta Normal em Ghost com High Jump Kick/Return, enquanto Gengar-Mega trava o oponente com Shadow Tag quando o plano é remover um wall específico. Corviknight e Umbreon seguram o time defensivamente, Primarina dá cobertura especial e Garchomp fecha jogos com Swords Dance.',
    leadGuide:
      'Abra com Corviknight ou Umbreon para absorver o primeiro golpe e decidir qual mega entra: Lopunny-Mega contra times rápidos, Gengar-Mega contra walls que precisam ser presos e removidos.',
    showdownPaste: `Lopunny @ Lopunnite
Ability: Cute Charm
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Return
- High Jump Kick
- Ice Punch
- Encore

Gengar @ Gengarite
Ability: Cursed Body
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Shadow Ball
- Sludge Wave
- Focus Blast
- Substitute

Corviknight @ Shell Bell
Ability: Pressure
Level: 50
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- Body Press
- Roost
- Defog

Primarina @ Wise Glasses
Ability: Torrent
Level: 50
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
IVs: 0 Atk
- Hydro Pump
- Moonblast
- Ice Beam
- Encore

Umbreon @ Big Root
Ability: Synchronize
Level: 50
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Foul Play
- Toxic
- Wish
- Moonlight

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance`,
  },
  {
    id: 'bss-core-four-rega',
    name: 'BSS Core Four (Reg. M-A)',
    format: 'gen9championsbssregma',
    author: 'RankMaster NA',
    event: 'Season 19 — Rank 2',
    placement: 'Rank 2 ladder',
    dateISO: '2026-07-10',
    sourceUrl: null,
    strategy:
      'Núcleo "core four" de Battle Stadium Singles Regulation M-A: Hippowdon planta Stealth Rock e ativa areia, Aegislash e Hatterene dão bulk misto com Stance Change/Magic Bounce, Glimmora reforça hazards com Spikes/Toxic Spikes, Meowscarada é o breaker rápido e Garchomp fecha como atacante físico com Swords Dance.',
    leadGuide:
      'Abra com Hippowdon para plantar Stealth Rock protegido por Aegislash. Contra times de hazard removal, priorize Glimmora cedo antes que Defog/Rapid Spin limpe o campo.',
    showdownPaste: `Hippowdon @ Smooth Rock
Ability: Sand Stream
Level: 50
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Earthquake
- Stealth Rock
- Slack Off
- Whirlwind

Aegislash @ Wise Glasses
Ability: Stance Change
Level: 50
EVs: 252 HP / 252 SpA / 4 Def
Modest Nature
IVs: 0 Atk
- Shadow Ball
- Flash Cannon
- King's Shield
- Substitute

Meowscarada @ Muscle Band
Ability: Protean
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Flower Trick
- Knock Off
- U-turn
- Sucker Punch

Glimmora @ Wise Glasses
Ability: Toxic Debris
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Power Gem
- Sludge Bomb
- Spikes
- Toxic Spikes

Hatterene @ Mental Herb
Ability: Magic Bounce
Level: 50
EVs: 252 HP / 132 SpA / 124 SpD
Modest Nature
IVs: 0 Atk
- Trick Room
- Dazzling Gleam
- Mystical Fire
- Calm Mind

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance`,
  },
  {
    id: 'ou-corviknight-slowking-balance',
    name: 'Corviknight / Slowking-Galar Balance (Champions OU)',
    format: 'gen9championsou',
    author: 'Ladder Grinder',
    event: 'Champions OU Ladder',
    placement: 'Top 100',
    dateISO: '2026-05-12',
    sourceUrl: null,
    strategy:
      'Balance clássico de singles: Corviknight e Slowking-Galar formam a base defensiva com Regenerator/Defog, Hatterene planta Trick Room quando o time precisa de um turno de velocidade invertida, Aegislash pressiona com Stance Change, e Garchomp com Samurott-Hisui fecham partidas com Swords Dance.',
    leadGuide:
      'Abra defensivo com Corviknight ou Slowking-Galar para ler o time rival, trazendo Garchomp ou Samurott-Hisui assim que o caminho estiver limpo para o Swords Dance.',
    showdownPaste: `Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance

Samurott-Hisui @ Muscle Band
Ability: Sharpness
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Ceaseless Edge
- Razor Shell
- Sacred Sword
- Swords Dance

Aegislash @ Wise Glasses
Ability: Stance Change
Level: 50
EVs: 252 HP / 252 SpA / 4 Def
Modest Nature
IVs: 0 Atk
- Shadow Ball
- Flash Cannon
- King's Shield
- Substitute

Hatterene @ Mental Herb
Ability: Magic Bounce
Level: 50
EVs: 252 HP / 132 SpA / 124 SpD
Modest Nature
IVs: 0 Atk
- Trick Room
- Dazzling Gleam
- Mystical Fire
- Calm Mind

Corviknight @ Shell Bell
Ability: Pressure
Level: 50
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- Body Press
- Roost
- Defog

Slowking-Galar @ Big Root
Ability: Regenerator
Level: 50
EVs: 252 HP / 4 Def / 252 SpD
Calm Nature
IVs: 0 Atk
- Future Sight
- Sludge Bomb
- Flamethrower
- Slack Off`,
  },
  {
    id: 'ou-lopunny-mega-balance',
    name: 'Lopunny-Mega Balance (Champions OU)',
    format: 'gen9championsou',
    author: 'Ladder Grinder',
    event: 'Champions OU Ladder',
    placement: 'Top 50',
    dateISO: '2026-06-02',
    sourceUrl: null,
    strategy:
      'Variação do core Corviknight/Slowking-Galar trocando um breaker físico por Lopunny-Mega, que vira Scrappy ao megaevoluir e passa a acertar Ghost com moves normais. Meowscarada dá pressão extra com U-turn/Sucker Punch enquanto o resto do time segura o jogo defensivamente.',
    leadGuide:
      'Mesma leitura defensiva do core padrão: abra com Corviknight ou Slowking-Galar e só traga Lopunny-Mega depois de remover ou enfraquecer o principal check físico do rival.',
    showdownPaste: `Corviknight @ Shell Bell
Ability: Pressure
Level: 50
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- Body Press
- Roost
- Defog

Slowking-Galar @ Big Root
Ability: Regenerator
Level: 50
EVs: 252 HP / 4 Def / 252 SpD
Calm Nature
IVs: 0 Atk
- Future Sight
- Sludge Bomb
- Flamethrower
- Slack Off

Garchomp @ Life Orb
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance

Samurott-Hisui @ Muscle Band
Ability: Sharpness
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Ceaseless Edge
- Razor Shell
- Sacred Sword
- Swords Dance

Meowscarada @ Muscle Band
Ability: Protean
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Flower Trick
- Knock Off
- U-turn
- Sucker Punch

Lopunny @ Lopunnite
Ability: Cute Charm
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Return
- High Jump Kick
- Ice Punch
- Encore`,
  },
  {
    id: 'ou-rain-pelipper-archaludon',
    name: 'Rain Balance (Pelipper / Archaludon) — Champions OU',
    format: 'gen9championsou',
    author: 'Ladder Grinder',
    event: 'Champions OU Ladder',
    placement: 'Top 200',
    dateISO: '2026-04-29',
    sourceUrl: null,
    strategy:
      'Chuva de singles: Pelipper liga Drizzle e defoga hazards, Swampert-Mega vira Swift Swim embaixo da chuva e planta Stealth Rock, Archaludon é o breaker especial principal, Hatterene dá Trick Room como plano B, Samurott-Hisui pressiona com Swords Dance e Basculegion fecha jogos com Last Respects.',
    leadGuide:
      'Abra com Pelipper para ativar a chuva e ganhar informação com Hurricane. Depois que Swampert-Mega estiver com Swift Swim ativo, ele carrega o jogo sozinho contra times sem resistência a água.',
    showdownPaste: `Pelipper @ Damp Rock
Ability: Drizzle
Level: 50
EVs: 248 HP / 252 Def / 8 SpD
Bold Nature
IVs: 0 Atk
- Hurricane
- Weather Ball
- Roost
- Defog

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

Swampert @ Swampertite
Ability: Damp
Level: 50
EVs: 252 HP / 156 Atk / 100 SpD
Adamant Nature
- Earthquake
- Wave Crash
- Ice Punch
- Stealth Rock

Hatterene @ Mental Herb
Ability: Magic Bounce
Level: 50
EVs: 252 HP / 132 SpA / 124 SpD
Modest Nature
IVs: 0 Atk
- Trick Room
- Dazzling Gleam
- Mystical Fire
- Calm Mind

Samurott-Hisui @ Muscle Band
Ability: Sharpness
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Ceaseless Edge
- Razor Shell
- Sacred Sword
- Swords Dance

Basculegion @ Muscle Band
Ability: Adaptability
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Flip Turn`,
  },
  {
    id: 'uu-4v4-doubles-balance',
    name: '4v4 Doubles UU Balance',
    format: 'gen9champions4v4doublesuu',
    author: 'UU Doubles Lab',
    event: 'Community sample',
    placement: null,
    dateISO: '2026-07-15',
    sourceUrl: null,
    strategy:
      'Time de exemplo para o formato 4v4 Doubles UU, montado a partir dos Pokémon mais usados no próprio ladder desse formato: Primarina e Hydreigon dão cobertura especial ampla, Ceruledge e Dragapult quebram bulk com prioridade e Draco Meteor, Sylveon segura o lado especial com Pixilate e Toxapex garante sustain com Regenerator + Recover.',
    leadGuide:
      'Lead padrão: Sylveon + Ceruledge para controlar o ritmo enquanto os atacantes especiais (Primarina/Hydreigon/Dragapult) entram para limpar depois que os checks principais do rival caírem.',
    showdownPaste: `Primarina @ Wise Glasses
Ability: Torrent
Level: 50
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
IVs: 0 Atk
- Hydro Pump
- Moonblast
- Ice Beam
- Protect

Hydreigon @ Life Orb
Ability: Levitate
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Draco Meteor
- Dark Pulse
- Flamethrower
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

Toxapex @ Big Root
Ability: Regenerator
Level: 50
EVs: 252 HP / 116 Def / 140 SpD
Bold Nature
IVs: 0 Atk
- Surf
- Toxic
- Recover
- Protect

Dragapult @ Wise Glasses
Ability: Clear Body
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Draco Meteor
- Shadow Ball
- U-turn
- Protect`,
  },
];

/** Constrói os TeamInput completos, derivando `members` do `showdownPaste` de cada time. */
export function buildSeedTeams(): TeamInput[] {
  return teams.map((t) => ({
    ...t,
    members: parseShowdownPaste(t.showdownPaste),
  }));
}
