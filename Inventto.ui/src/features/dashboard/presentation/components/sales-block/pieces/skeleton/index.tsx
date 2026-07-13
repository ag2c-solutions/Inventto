import { Skeleton } from '@/shared/components/ui/skeleton';

interface SalesBlockSkeletonProps {
  variant: 'chart' | 'simple';
}

export function SalesBlockSkeleton({ variant }: SalesBlockSkeletonProps) {
  if (variant === 'simple') {
    return <Skeleton className="h-20 rounded-lg" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-64" />
      </div>
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}
