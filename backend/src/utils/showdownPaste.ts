import { toCanonicalName, showdownSpriteUrl } from './format.js';
import type { TeamMember } from '../types/contract.js';

/**
 * Parser mínimo do formato de exportação do Pokémon Showdown, usado para
 * derivar os `members` (nome/sprite/item) de um time a partir do paste.
 * Suporta: "Name @ Item", "Nickname (Name) @ Item" e marcadores de gênero.
 */
export function parseShowdownPaste(paste: string): TeamMember[] {
  const members: TeamMember[] = [];
  const blocks = paste
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const firstLine = block.split('\n')[0].trim();
    if (!firstLine) continue;

    const [namePart, itemPart] = firstLine.split('@').map((s) => s.trim());
    let display = namePart;

    // Remove marcador de gênero: "Pikachu (F)" → "Pikachu"
    display = display.replace(/\s*\((M|F)\)\s*$/i, '').trim();
    // "Apelido (Espécie)" → usa a espécie
    const nick = display.match(/^.*\(([^()]+)\)\s*$/);
    if (nick) display = nick[1].trim();

    if (!display) continue;
    const name = toCanonicalName(display);
    members.push({
      name,
      displayName: display,
      spriteUrl: showdownSpriteUrl(display),
      item: itemPart && itemPart.length > 0 ? itemPart : null,
    });
  }
  return members;
}
