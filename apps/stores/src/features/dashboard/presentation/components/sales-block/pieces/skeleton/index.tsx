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
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}
