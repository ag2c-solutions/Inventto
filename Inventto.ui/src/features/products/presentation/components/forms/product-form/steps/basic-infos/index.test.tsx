import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductFormProviderProps } from '../../hook';
import { mockFormData, renderWithProductProvider } from '../../mocks';

import { ProductBasicInfo } from '.';

vi.mock('./field-category', () => ({
  ProductFormFieldCategory: () => (
    <div data-testid="mock-category-field">Mock Category</div>
  )
}));

vi.mock('../../../../../hooks/use-queries', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useProductMovementsQuery: vi.fn(() => ({ data: true }))
  };
});

describe('ProductBasicInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('must render all fields and child components in "Create" mode.', () => {
    renderWithProductProvider(<ProductBasicInfo />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Estoque mínimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Este produto tem variações')
    ).toBeInTheDocument();

    expect(screen.getByTestId('mock-category-field')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeEnabled();
    expect(screen.getByLabelText('SKU')).toBeEnabled();
  });

  it('should allow typing in the text and number fields.', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductBasicInfo />);

    const nameInput = screen.getByLabelText('Nome');
    const skuInput = screen.getByLabelText('SKU');
    const stockInput = screen.getByLabelText('Estoque mínimo');
    const descInput = screen.getByLabelText('Descrição');

    await user.type(nameInput, 'Camiseta');
    await user.clear(skuInput);
    await user.type(skuInput, 'CAM-001');
    await user.type(stockInput, '15');
    await user.type(descInput, 'Uma descrição legal');

    expect(nameInput).toHaveValue('Camiseta');
    expect(skuInput).toHaveValue('CAM-001');
    expect(stockInput).toHaveValue(15);
    expect(descInput).toHaveValue('Uma descrição legal');
  });

  it('must disable Name and SKU (if hasMovements) in "Edit" mode.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit' as const,
      product: {
        ...mockFormData,
        hasVariants: false,
        name: 'Produto Existente',
        sku: 'SKU-EXISTENTE'
      } as never
    };

    renderWithProductProvider(<ProductBasicInfo />, { providerProps });

    const nameInput = screen.getByLabelText('Nome');
    const skuInput = screen.getByLabelText('SKU');

    expect(nameInput).toHaveValue('Produto Existente');
    expect(skuInput).toHaveValue('SKU-EXISTENTE');
    expect(nameInput).toBeDisabled();
    expect(skuInput).toBeDisabled();
  });

  it('must convert the Minimum Stock input to a number.', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductBasicInfo />);

    const stockInput = screen.getByLabelText('Estoque mínimo');

    await user.type(stockInput, '10');
    expect(stockInput).toHaveValue(10);

    await user.clear(stockInput);
    expect(stockInput).toHaveValue(0);
  });

  describe('Logic of the "HasVariants" Switch', () => {
    it('must be enabled in "Create" mode', () => {
      renderWithProductProvider(<ProductBasicInfo />);
      const switchElement = screen.getByLabelText('Este produto tem variações');
      expect(switchElement).toBeEnabled();
    });

    it('should be disabled in "Edit" mode if the product ALREADY has variants (hasVariants: true).', () => {
      const providerProps: Partial<ProductFormProviderProps> = {
        mode: 'Edit' as const,
        product: {
          ...mockFormData,
          hasVariants: true,
          allImages: [
            {
              id: 'img1',
              file: new File([''], 'test.png', { type: 'image/png' }),
              name: 'test.png',
              src: 'blob:mock-url',
              type: 'image/png',
              isPrimary: true
            }
          ]
        } as never
      };

      renderWithProductProvider(<ProductBasicInfo />, { providerProps });

      const switchElement = screen.getByLabelText('Este produto tem variações');

      expect(switchElement).toBeDisabled();
      expect(switchElement).toBeChecked();
    });

    it(' must be enabled in "Edit" mode if the product has NO variants (hasVariants: false).', () => {
      const providerProps: Partial<ProductFormProviderProps> = {
        mode: 'Edit' as const,
        product: {
          ...mockFormData,
          hasVariants: false,
          allImages: [
            {
              id: 'img1',
              file: new File([''], 'test.png', { type: 'image/png' }),
              name: 'test.png',
              src: 'blob:mock-url',
              type: 'image/png',
              isPrimary: false
            }
          ]
        } as never
      };

      renderWithProductProvider(<ProductBasicInfo />, { providerProps });

      const switchElement = screen.getByLabelText('Este produto tem variações');

      expect(switchElement).toBeEnabled();
      expect(switchElement).not.toBeChecked();
    });
  });
});
