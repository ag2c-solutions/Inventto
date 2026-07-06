import { ColorBadge } from '@/shared/components/common/color-badge';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils';

import type { VariantOption } from '../../../domain/entities';

interface VariantOptionBadgeProps {
  option: VariantOption;
  className?: string;
}

export function VariantOptionBadge({
  option,
  className
}: VariantOptionBadgeProps) {
  return option.value.includes('#') ? (
    <ColorBadge className={className} color={option.value} />
  ) : (
    <Badge
      variant="secondary"
      className={cn('flex items-center gap-2 pl-1 pr-1.5 py-1', className)}
    >
      <p className="flex gap-1">
        <span className="text-xs text-muted-foreground">
          {`${option.name}:  `}
        </span>
        <span className="text-xs text-foreground">{option.value}</span>
      </p>
    </Badge>
  );
}
