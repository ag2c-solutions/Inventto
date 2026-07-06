import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useProductForm } from '../../hook';
import { renderWithProductProvider } from '../../mocks';

vi.mock('../attributes', () => ({
  ProductAttributes: () => <div data-testid="product-attributes" />
}));

vi.mock('../variants', () => ({
  ProductVariants: () => <div data-testid="product-variants" />
}));

import { ProductVariations } from '.';

function VariantsDebugHarness() {
  const { form } = useProductForm();

  const applyCompleteAttribute = () => {
    form.setValue('sku', 'CAM', { shouldDirty: true });
    form.setValue(
      'attributes',
      [{ name: 'Cor', values: ['Azul', 'Preto'], type: 'text' }],
      { shouldDirty: true }
    );
  };

  const variants = form.watch('variants') as { sku: string }[] | undefined;

  return (
    <>
      <button type="button" onClick={applyCompleteAttribute}>
        set-attributes
      </button>
      <span data-testid="variants-count">{variants?.length ?? 0}</span>
    </>
  );
}

describe('ProductVariations', () => {
  it('should render the section title and the attributes/variants steps', () => {
    renderWithProductProvider(<ProductVariations />, {
      providerProps: { mode: 'Create' }
    });

    expect(screen.getByText('Atributos e variações')).toBeInTheDocument();
    expect(screen.getByTestId('product-attributes')).toBeInTheDocument();
    expect(screen.getByTestId('product-variants')).toBeInTheDocument();
  });

  it('should regenerate the variants grid reactively when attributes become complete', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(
      <>
        <ProductVariations />
        <VariantsDebugHarness />
      </>,
      { providerProps: { mode: 'Create' } }
    );

    expect(screen.getByTestId('variants-count')).toHaveTextContent('0');

    await user.click(screen.getByText('set-attributes'));

    expect(screen.getByTestId('variants-count')).toHaveTextContent('2');
  });
});
