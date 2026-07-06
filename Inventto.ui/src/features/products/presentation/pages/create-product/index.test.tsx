import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../components/forms/product-form', () => ({
  ProductForm: () => <div data-testid="product-form" />
}));

vi.mock('../../components/forms/product-form/hook', () => ({
  ProductFormProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}));

import { CreateProductPage } from '.';

describe('CreateProductPage', () => {
  it('should render the page heading, back link and the product form', () => {
    render(
      <MemoryRouter>
        <CreateProductPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Adicionar produto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /produtos/i })).toBeInTheDocument();
    expect(screen.getByTestId('product-form')).toBeInTheDocument();
  });
});
