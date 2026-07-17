import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils';

interface AttentionBlockSkeletonProps {
  count: number;
}

export function AttentionBlockSkeleton({ count }: AttentionBlockSkeletonProps) {
  return (
    <div
      className={cn('grid gap-3', count > 1 ? 'sm:grid-cols-3' : 'grid-cols-1')}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}
