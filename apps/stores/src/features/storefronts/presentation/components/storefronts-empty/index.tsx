import { Link } from 'react-router';
import { Store } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export function StorefrontsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <Store className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h3 className="text-lg font-semibold">Nenhuma vitrine ainda.</h3>

      <p className="max-w-md text-sm text-muted-foreground">
        Crie uma vitrine para vender online pelo link.
      </p>

      <Button asChild>
        <Link to="/storefronts/novo">Criar vitrine</Link>
      </Button>
    </div>
  );
}
