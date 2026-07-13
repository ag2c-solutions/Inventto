import { Skeleton } from '@/shared/components/ui/skeleton';

interface ActivityBlockSkeletonProps {
  variant: 'full' | 'simple';
}

export function ActivityBlockSkeleton({ variant }: ActivityBlockSkeletonProps) {
  if (variant === 'simple') {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
