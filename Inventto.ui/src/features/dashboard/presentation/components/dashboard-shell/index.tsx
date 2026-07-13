import { cn } from '@/shared/utils';

import type { Role } from '@/features/permissions';

import { DashboardService } from '../../../domain/services';

import { BlockHeading } from './pieces/block-heading';

interface DashboardShellProps {
  role: Role;
}

export function DashboardShell({ role }: DashboardShellProps) {
  const view = DashboardService.getRoleView(role);

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Atenção imediata" className="flex flex-col gap-3">
        <BlockHeading title="Atenção imediata" rf="RF036" />
        <div
          className={cn(
            'grid gap-3',
            view.attentionCards.length > 1 ? 'sm:grid-cols-3' : 'grid-cols-1'
          )}
        >
          {view.attentionCards.map((label) => (
            <div
              key={label}
              className="rounded-lg border p-4 text-sm text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Resumo de vendas" className="flex flex-col gap-3">
        <BlockHeading title="Resumo de vendas" rf="RF037" />
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <p>
            {view.showSalesChart
              ? 'Faturamento do período'
              : 'Suas vendas hoje'}
          </p>
          {view.showOwnerExtras && (
            <p className="mt-1 text-xs">
              Margem média e inventário a custo — exclusivo do Dono
            </p>
          )}
        </div>
      </section>

      <section aria-label="Atividade e atalhos" className="flex flex-col gap-3">
        <BlockHeading title="Atividade e atalhos" rf="RF038" />
        <div
          className={cn(
            'grid gap-4',
            view.activityCards.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'
          )}
        >
          {view.activityCards.map((label) => (
            <div
              key={label}
              className="rounded-lg border p-4 text-sm text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
