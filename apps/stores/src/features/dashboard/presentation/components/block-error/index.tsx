import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface BlockErrorProps {
  onRetry: () => void;
}

export function BlockError({ onRetry }: BlockErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <AlertTriangle className="size-5 text-muted-foreground" />
      <p className="text-sm font-medium">Não foi possível carregar.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Tentar de novo
      </Button>
    </div>
  );
}
