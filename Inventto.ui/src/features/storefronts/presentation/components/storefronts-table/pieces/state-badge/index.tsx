import { Badge } from '@/shared/components/ui/badge';

import type { StorefrontState } from '../../../../../domain/entities';

interface StateBadgeProps {
  state: StorefrontState;
}

export function StateBadge({ state }: StateBadgeProps) {
  if (state === 'live') {
    return (
      <Badge className="gap-1.5 rounded-full border-green-200 bg-green-100 font-medium text-green-800">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        No ar
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="rounded-full font-medium text-muted-foreground"
    >
      Inativa
    </Badge>
  );
}
