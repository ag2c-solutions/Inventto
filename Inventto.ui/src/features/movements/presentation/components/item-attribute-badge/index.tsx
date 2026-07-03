import { ColorBadge } from '@/shared/components/common/color-badge';
import { Badge } from '@/shared/components/ui/badge';

interface ItemAttributeBadgeProps {
  option: { name: string; value: string };
}

export function ItemAttributeBadge({ option }: ItemAttributeBadgeProps) {
  return option.value.includes('#') ? (
    <ColorBadge color={option.value} />
  ) : (
    <Badge variant="secondary" className="text-xs font-normal">
      {option.value}
    </Badge>
  );
}
