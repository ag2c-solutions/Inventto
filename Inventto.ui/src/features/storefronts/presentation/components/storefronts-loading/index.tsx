import { Skeleton } from '@/shared/components/ui/skeleton';

export function StorefrontsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full rounded-md sm:w-[280px]" />

      <div className="divide-y overflow-hidden rounded-lg border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
