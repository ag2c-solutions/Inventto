import { TriangleAlert } from 'lucide-react';

export const DangerZoneTabContent = () => {
  return (
    <section
      aria-label="Zona de risco"
      className="rounded-xl border border-destructive/50 bg-destructive/5 p-6"
    >
      <h2 className="flex items-center gap-2 text-base font-bold text-destructive">
        <TriangleAlert className="size-4" />
        Zona de risco
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ações sensíveis que afetam a operação inteira desta organização.
      </p>
    </section>
  );
};
