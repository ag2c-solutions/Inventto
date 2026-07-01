import { Skeleton } from '@/shared/components/ui/skeleton';

export function ProductDetailLoading() {
  return (
    <div className="px-4 md:px-6 pt-4 space-y-6">
      <Skeleton className="h-5 w-24 rounded-full" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left column — image */}
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right column — infos */}
        <div className="flex flex-col gap-5">
          {/* Status + menu */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Name + SKU + description */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          {/* Attribute labels */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-10 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-18 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-10 rounded-full" />
                <Skeleton className="h-8 w-10 rounded-full" />
              </div>
            </div>
          </div>

          {/* Inventory card */}
          <Skeleton className="h-36 w-full rounded-xl" />

          {/* Grade summary card */}
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
