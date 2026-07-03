import { NavLink } from 'react-router';
import { ArrowUp, Inbox } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface MovementsOnboardingEmptyProps {
  canRegister: boolean;
}

export function MovementsOnboardingEmpty({
  canRegister
}: MovementsOnboardingEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar/70">
        <Inbox className="h-7 w-7 text-muted-foreground/70" />
      </div>

      <h3 className="text-lg font-semibold">Nenhuma movimentação ainda.</h3>

      <p className="max-w-md text-sm text-muted-foreground">
        Entradas e saídas aparecem aqui assim que houver registros. Comece
        adicionando estoque a um produto.
      </p>

      {canRegister && (
        <Button className="mt-2 bg-green-950" asChild>
          <NavLink className="flex items-center gap-2" to="/movements/new">
            <ArrowUp className="h-4 w-4" />
            Registrar entrada
          </NavLink>
        </Button>
      )}
    </div>
  );
}
