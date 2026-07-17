import { Skeleton } from '@/shared/components/ui/skeleton';

export function CatalogsTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full sm:w-[280px] rounded-md" />

      <div className="border rounded-lg overflow-hidden divide-y">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
