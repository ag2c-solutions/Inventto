import { Skeleton } from '@/shared/components/ui/skeleton';

export function MembersCardListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="size-9 shrink-0" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
