import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogsListPage } from './index';

const mockUseCatalogsQuery = vi.fn();

vi.mock('../../hooks/use-queries', () => ({
  useCatalogsQuery: () => mockUseCatalogsQuery()
}));

vi.mock('../../components/catalogs-table', () => ({
  CatalogsTable: ({
    data,
    isLoading
  }: {
    data: unknown[];
    isLoading: boolean;
  }) => (
    <div data-testid="mock-catalogs-table">
      <span data-testid="data-length">{data.length}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
    </div>
  )
}));

describe('CatalogsListPage', () => {
  beforeEach(() => {
    mockUseCatalogsQuery.mockReturnValue({ data: [], isLoading: false });
  });

  it('should render the header and pass query state to the table', () => {
    render(<CatalogsListPage />);

    expect(
      screen.getByRole('heading', { name: 'Catálogos' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('should forward loading state to the table while fetching', () => {
    mockUseCatalogsQuery.mockReturnValue({ data: undefined, isLoading: true });

    render(<CatalogsListPage />);

    expect(screen.getByTestId('data-length')).toHaveTextContent('0');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });
});
