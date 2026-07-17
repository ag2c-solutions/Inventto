import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorefrontsListPage } from './index';

const { mockUseStorefrontsQuery } = vi.hoisted(() => ({
  mockUseStorefrontsQuery: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useStorefrontsQuery: () => mockUseStorefrontsQuery()
}));

vi.mock('../../components/storefronts-table', () => ({
  StorefrontsTable: ({
    data,
    isLoading
  }: {
    data: unknown[];
    isLoading: boolean;
  }) => (
    <div data-testid="mock-storefronts-table">
      <span data-testid="data-length">{data.length}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
    </div>
  )
}));

describe('StorefrontsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStorefrontsQuery.mockReturnValue({ data: [], isLoading: false });
  });

  it('should render the header and pass query state to the table', () => {
    render(<StorefrontsListPage />);

    expect(
      screen.getByRole('heading', { name: 'Vitrines' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('should forward loading state to the table while fetching', () => {
    mockUseStorefrontsQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(<StorefrontsListPage />);

    expect(screen.getByTestId('data-length')).toHaveTextContent('0');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });
});
