import type { Role } from '@/features/permissions';

import { ActivityBlock } from '../activity-block';
import { AttentionBlock } from '../attention-block';
import { SalesBlock } from '../sales-block';

import { BlockHeading } from './pieces/block-heading';

interface DashboardShellProps {
  role: Role;
}

export function DashboardShell({ role }: DashboardShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Atenção imediata" className="flex flex-col gap-3">
        <BlockHeading title="Atenção imediata" rf="RF036" />
        <AttentionBlock role={role} />
      </section>

      <section aria-label="Resumo de vendas" className="flex flex-col gap-3">
        <SalesBlock role={role} />
      </section>

      <section aria-label="Atividade e atalhos" className="flex flex-col gap-3">
        <BlockHeading title="Atividade e atalhos" rf="RF038" />
        <ActivityBlock role={role} />
      </section>
    </div>
  );
}
