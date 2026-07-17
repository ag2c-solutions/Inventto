import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrdersBoardSkeleton } from './index';

describe('OrdersBoardSkeleton', () => {
  it('should render the 4 macro-state columns as skeletons', () => {
    const { container } = render(<OrdersBoardSkeleton />);

    const board = container.firstElementChild;
    expect(board?.children).toHaveLength(4);
  });

  it('should render placeholder cards inside each column', () => {
    const { container } = render(<OrdersBoardSkeleton />);

    const skeletonNodes = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonNodes.length).toBeGreaterThan(0);
  });
});
