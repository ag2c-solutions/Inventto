import type { ReactNode } from 'react';

import { BlockError } from '../block-error';

interface BlockBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  skeleton: ReactNode;
  children: ReactNode;
}

export function BlockBoundary({
  isLoading,
  isError,
  onRetry,
  skeleton,
  children
}: BlockBoundaryProps) {
  if (isLoading) return <>{skeleton}</>;
  if (isError) return <BlockError onRetry={onRetry} />;

  return <>{children}</>;
}
