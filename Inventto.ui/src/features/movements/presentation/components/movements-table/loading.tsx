import { Skeleton } from '@/shared/components/ui/skeleton';

export function MovementsListTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-9 w-[220px] rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[260px] rounded-md" />
        <Skeleton className="h-9 w-[170px] rounded-md" />
        <Skeleton className="h-9 w-[170px] rounded-md" />
        <Skeleton className="h-9 w-[220px] rounded-md" />
      </div>

      <div className="border rounded-lg overflow-hidden divide-y">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex flex-col gap-1.5 w-16">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-2.5 w-10" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="flex flex-col gap-1.5 flex-1 max-w-[220px]">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
