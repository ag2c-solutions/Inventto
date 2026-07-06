import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { importCandidateVariantFactory } from '../../../../../tests/factories/import-candidate.factory';

const { mockUseSourceProductVariantsQuery } = vi.hoisted(() => ({
  mockUseSourceProductVariantsQuery: vi.fn()
}));

vi.mock('../../../../hooks/use-queries', () => ({
  useSourceProductVariantsQuery: () => mockUseSourceProductVariantsQuery()
}));

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

import { ImportVariantsPanel } from '.';

describe('ImportVariantsPanel', () => {
  it('should show a loading skeleton while fetching', () => {
    mockUseSourceProductVariantsQuery.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(
      <ImportVariantsPanel
        sourceOrganizationId="org-2"
        productId="prod-1"
        enabled
      />
    );

    expect(screen.getByText('SKU').parentElement).toBeInTheDocument();
  });

  it('should show an empty message when there are no variants', () => {
    mockUseSourceProductVariantsQuery.mockReturnValue({
      data: [],
      isLoading: false
    });

    render(
      <ImportVariantsPanel
        sourceOrganizationId="org-2"
        productId="prod-1"
        enabled
      />
    );

    expect(
      screen.getByText('Nenhuma variante encontrada para este produto.')
    ).toBeInTheDocument();
  });

  it('should render each variant sku and its options', () => {
    const variant = importCandidateVariantFactory.build({ sku: 'VAR-SKU-1' });
    mockUseSourceProductVariantsQuery.mockReturnValue({
      data: [variant],
      isLoading: false
    });

    render(
      <ImportVariantsPanel
        sourceOrganizationId="org-2"
        productId="prod-1"
        enabled
      />
    );

    expect(screen.getByText('VAR-SKU-1')).toBeInTheDocument();
  });
});
