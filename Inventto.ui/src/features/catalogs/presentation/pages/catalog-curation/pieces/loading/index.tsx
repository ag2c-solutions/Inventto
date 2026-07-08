import { Skeleton } from '@/shared/components/ui/skeleton';

export function CurationLoading() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-lg border p-3"
        >
          <Skeleton className="h-11 w-11 rounded-md" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      ))}
    </div>
  );
}
