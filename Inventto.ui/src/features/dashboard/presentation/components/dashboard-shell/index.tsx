import { cn } from '@/shared/utils';

import type { Role } from '@/features/permissions';

import { DashboardService } from '../../../domain/services';
import { AttentionBlock } from '../attention-block';
import { SalesBlock } from '../sales-block';

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
        <AttentionBlock role={role} />
      </section>

      <section aria-label="Resumo de vendas" className="flex flex-col gap-3">
        <BlockHeading title="Resumo de vendas" rf="RF037" />
        <SalesBlock role={role} />
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
