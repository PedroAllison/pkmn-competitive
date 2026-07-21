import { useEffect } from 'react';
import type { Format } from '../api/types';

export interface FormatSelectProps {
  formats: Format[];
  format: string;
  onFormatChange: (format: string) => void;
  /** Se `true`, inclui uma opção "Todos os formatos" (para telas de listagem). */
  includeAllOption?: boolean;
}

/**
 * Seletor de formato do Pokémon Champions (única "empresa"/jogo coberta
 * pelo produto — ver docs/API_CONTRACT.md). Antes havia um seletor de jogo
 * também (Champions/Scarlet-Violet/Legends Z-A); removido porque o produto
 * cobre só Champions agora.
 */
export function FormatSelect({ formats, format, onFormatChange, includeAllOption = false }: FormatSelectProps) {
  useEffect(() => {
    const isValid = format === '' ? includeAllOption : formats.some((f) => f.id === format);
    if (!isValid) {
      onFormatChange(includeAllOption ? '' : (formats[0]?.id ?? ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formats]);

  return (
    <select
      className="md-input"
      value={format}
      onChange={(e) => onFormatChange(e.target.value)}
      style={{ minWidth: 220 }}
      disabled={formats.length === 0}
    >
      {includeAllOption && <option value="">Todos os formatos</option>}
      {formats.length === 0 && !includeAllOption && <option value="">Nenhum formato disponível</option>}
      {formats.map((f) => (
        <option key={f.id} value={f.id}>
          {f.label}
        </option>
      ))}
    </select>
  );
}
