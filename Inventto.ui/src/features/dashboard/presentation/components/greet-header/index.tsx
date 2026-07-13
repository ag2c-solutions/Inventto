import type { Role } from '@/features/permissions';

interface GreetHeaderProps {
  name: string;
  organizationName: string;
  role: Role;
}

export function GreetHeader({
  name,
  organizationName,
  role
}: GreetHeaderProps) {
  const subtitle =
    role === 'sales'
      ? `Aqui estão suas vendas e os pedidos a atender · ${organizationName}`
      : `Aqui está o resumo operacional de hoje · ${organizationName}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bom dia, {name}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 pr-3 pl-2 text-[11.5px] font-semibold text-foreground">
        <span
          className="size-1.5 rounded-full bg-[var(--status-healthy)]"
          aria-hidden
        />
        Atualizado agora
      </span>
    </div>
  );
}
