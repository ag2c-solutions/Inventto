import { Skeleton } from '@/shared/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}
