import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IProductVariant } from '../../../../../domain/entities';
import type { ProductFormProviderProps } from '../../hook';
import { renderWithProductProvider } from '../../mocks';

import { ProductVariants } from '.';

vi.mock('./field-variant-images', () => ({
  ProductFormFieldVariantImages: ({
    variantIndex
  }: {
    variantIndex: number;
  }) => (
    <div data-testid={`variant-images-${variantIndex}`}>
      Mock Images {variantIndex}
    </div>
  )
}));

vi.mock('../../../../hooks/use-queries', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useProductMovementsQuery: vi.fn(() => ({ data: true }))
  };
});

const mockVariants: IProductVariant[] = [
  {
    id: '1',
    sku: 'SKU-AZUL-P',
    stock: 5,
    minimumStock: 5,
    isActive: true,
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'P' }
    ],
    images: []
  },
  {
    id: '2',
    sku: 'SKU-AZUL-M',
    stock: 5,
    minimumStock: 10,
    isActive: true,
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'M' }
    ],
    images: []
  }
];

describe('ProductVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display the message "No variants generated" when the list is empty', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error - product is incomplete
      product: {
        hasVariants: true,
        variants: []
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    expect(screen.getByText('Nenhuma variante gerada.')).toBeInTheDocument();
    expect(
      screen.getByText('Volte ao Passo 2 para adicionar atributos.')
    ).toBeInTheDocument();

    expect(screen.queryByText('Grade de variantes')).not.toBeInTheDocument();
  });

  it('The grid should be rendered with the variants correctly', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error - product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    expect(screen.getByText('Grade de variantes')).toBeInTheDocument();
    expect(screen.getByText('2 variantes geradas')).toBeInTheDocument();

    expect(screen.getByText('Azul · P')).toBeInTheDocument();
    expect(screen.getByText('Azul · M')).toBeInTheDocument();
    expect(screen.getByTestId('variant-images-0')).toBeInTheDocument();
    expect(screen.getByTestId('variant-images-1')).toBeInTheDocument();
  });

  it('should allow editing SKU and Stock in "Create" mode', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Create' as const,
      // @ts-expect-error product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    const skuInputs = screen.getAllByPlaceholderText('SKU da variação');
    const stockInputs = screen.getAllByPlaceholderText('0');

    expect(skuInputs[0]).toHaveValue('SKU-AZUL-P');
    expect(skuInputs[0]).toBeEnabled();
    expect(stockInputs[0]).toHaveValue(5);

    await user.clear(skuInputs[0]);
    await user.type(skuInputs[0], 'NOVO-SKU');

    await user.clear(stockInputs[0]);
    await user.type(stockInputs[0], '99');

    expect(skuInputs[0]).toHaveValue('NOVO-SKU');
    expect(stockInputs[0]).toHaveValue(99);
  });

  it('must disable SKU editing in "Edit" mode if hasMovements.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit' as const,
      // @ts-expect-error product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    const skuInputs = screen.getAllByPlaceholderText('SKU da variação');
    const stockInputs = screen.getAllByPlaceholderText('0');

    expect(skuInputs[0]).toBeDisabled();
    expect(skuInputs[0]).toHaveValue('SKU-AZUL-P');
    expect(stockInputs[0]).toBeEnabled();
  });
});
