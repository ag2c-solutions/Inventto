import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

import { CARD_STYLES, type CardStyle } from '../../../domain/entities';

// v1: um único estilo — o Select já fica pronto para receber mais opções
// (CARD_STYLES em domain/entities) sem alterar este componente.
const CARD_STYLE_LABELS: Record<CardStyle, string> = {
  'minimal-large-image': 'Minimalista · imagem grande'
};

interface CardStyleSelectProps {
  value: CardStyle;
  onChange: (value: CardStyle) => void;
  disabled?: boolean;
}

export function CardStyleSelect({
  value,
  onChange,
  disabled
}: CardStyleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as CardStyle)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full max-w-96">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CARD_STYLES.map((style) => (
          <SelectItem key={style} value={style}>
            {CARD_STYLE_LABELS[style]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
