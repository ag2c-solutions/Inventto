import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogsListPage } from './index';

const { mockUseCatalogsQuery, mockUseIsMobile } = vi.hoisted(() => ({
  mockUseCatalogsQuery: vi.fn(),
  mockUseIsMobile: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useCatalogsQuery: () => mockUseCatalogsQuery()
}));

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: () => mockUseIsMobile()
}));

vi.mock('../../components/actions/create', () => ({
  CreateCatalogDialog: ({ iconOnly }: { iconOnly?: boolean }) => (
    <button
      type="button"
      data-testid="create-catalog"
      data-icon-only={String(Boolean(iconOnly))}
    >
      Criar catálogo
    </button>
  )
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
    vi.clearAllMocks();
    mockUseCatalogsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseIsMobile.mockReturnValue(false);
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

  it('should not render the header CTA on desktop (it lives in the table toolbar)', () => {
    render(<CatalogsListPage />);

    expect(screen.queryByTestId('create-catalog')).not.toBeInTheDocument();
  });

  it('should render the icon-only create CTA in the header on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(<CatalogsListPage />);

    expect(screen.getByTestId('create-catalog')).toHaveAttribute(
      'data-icon-only',
      'true'
    );
  });
});
