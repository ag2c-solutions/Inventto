import { Skeleton } from '@/shared/components/ui/skeleton';

export function OrganizationSettingsFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3 w-56" />
      </div>

      {/* Barra de abas */}
      <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border bg-muted/40 p-1">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Conteúdo — espelha a aba Loja (logo + campos) */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-4">
          <Skeleton className="size-[72px] rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
