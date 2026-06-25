import { CircleCheck, EyeOff } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';

type ProductTableColumnStatusProps = {
  isActive: boolean;
};

export function ProductTableColumnStatus({
  isActive
}: ProductTableColumnStatusProps) {
  if (isActive) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 rounded-full font-medium">
        <CircleCheck className="h-3 w-3" />
        Ativo
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground rounded-full font-medium"
    >
      <EyeOff className="h-3 w-3" />
      Inativo
    </Badge>
  );
}
