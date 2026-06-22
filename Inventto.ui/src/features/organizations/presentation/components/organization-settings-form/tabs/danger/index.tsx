import { TriangleAlert } from 'lucide-react';

import { Separator } from '@/shared/components/ui/separator';

import { DeactivateOrganizationDialog } from '../../../deactivate-organization-dialog';
import { DeleteOrganizationDialog } from '../../../delete-organization-dialog';

export const DangerZoneTabContent = () => {
  return (
    <section
      role="region"
      aria-label="Zona de risco"
      className="rounded-xl border border-destructive/50 bg-destructive/5 p-6"
    >
      <h2 className="flex items-center gap-2 text-xl font-bold text-destructive/70">
        <TriangleAlert className="size-4" />
        Zona de risco
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ações sensíveis que afetam a operação inteira desta organização.
      </p>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Desativar organização
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Pausa as vendas e tira as vitrines do ar temporariamente. Você pode
            reativar quando quiser.
          </p>
        </div>
        <DeactivateOrganizationDialog />
      </div>

      <Separator className="my-6 bg-destructive/20" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Excluir organização
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Encerra permanentemente esta unidade. Esta ação não pode ser
            desfeita.
          </p>
        </div>
        <DeleteOrganizationDialog />
      </div>
    </section>
  );
};
