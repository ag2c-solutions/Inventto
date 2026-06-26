import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWizard } from '@/shared/components/common/wizard';

import type { IProduct } from '../../../../../domain/entities';
import { renderWithProductProvider } from '../../mocks';

import { ProductSummary } from '.';

vi.mock('@/shared/components/common/wizard', () => ({
  useWizard: vi.fn()
}));

const mockGoToStep = vi.fn();

const mockSimpleProduct = {
  name: 'Produto Simples',
  sku: 'SKU-SIMPLES',
  stock: 10,
  minimumStock: 2,
  hasVariants: false,
  allImages: [
    { id: 'img1', url: 'url1', isPrimary: true, type: 'image', name: 'img1' }
  ],
  attributes: [],
  variants: [],
  categories: [{ id: '1', name: 'Geral' }],
  isActive: true
} as unknown as IProduct;

const mockVariableProduct: IProduct = {
  name: 'Produto Variável',
  categories: [{ id: 'cat-1', name: 'teste' }],
  sku: 'SKU-GLOBAL',
  hasVariants: true,
  isActive: true,
  attributes: [
    {
      id: '1',
      slug: 'cor',
      type: 'select',
      name: 'Cor',
      values: ['Azul', 'Vermelho']
    }
  ],
  stock: 0,
  minimumStock: 0,
  variants: [
    {
      id: 'var1',
      sku: 'SKU-AZUL',
      stock: 5,
      minimumStock: 1,
      isActive: true,
      options: [{ name: 'Cor', value: 'Azul' }],
      images: [{ id: 'img-azul', isPrimary: true }]
    }
  ],
  allImages: []
} as unknown as IProduct;

describe('ProductSummary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useWizard).mockReturnValue({
      state: {
        steps: [{ id: 'BasicInfo' }, { id: 'Images' }, { id: 'Variations' }]
      },
      actions: {
        goToStep: mockGoToStep
      }
    } as any);
  });

  it('should render correct basic infos for a simple product', () => {
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockSimpleProduct, mode: 'Edit' }
    });

    expect(screen.getByText('Resumo e confirmação')).toBeInTheDocument();
    expect(screen.getByText('Produto Simples')).toBeInTheDocument();
    expect(screen.getByText('SKU-SIMPLES')).toBeInTheDocument();
    expect(screen.getByText('Geral')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Should not render variations card
    expect(screen.queryByText('Variações')).not.toBeInTheDocument();
  });

  it('should render correct basic infos for a variable product', () => {
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockVariableProduct, mode: 'Edit' }
    });

    expect(screen.getByText('Produto Variável')).toBeInTheDocument();
    expect(screen.getByText('SKU-GLOBAL')).toBeInTheDocument();
    expect(screen.getByText('Por variante')).toBeInTheDocument();

    // Should render variations card
    expect(screen.getByText('Variações')).toBeInTheDocument();
    expect(screen.getByText('Cor')).toBeInTheDocument();
    expect(screen.getByText('Azul, Vermelho')).toBeInTheDocument();
    expect(screen.getByText('1 variante')).toBeInTheDocument();
  });

  it('should render images correctly, sorting primary first', () => {
    const productWithImages = {
      ...mockSimpleProduct,
      allImages: [
        {
          id: 'img2',
          url: 'url2',
          isPrimary: false,
          type: 'image',
          name: 'img2'
        },
        {
          id: 'img1',
          url: 'url1',
          isPrimary: true,
          type: 'image',
          name: 'img1'
        }
      ]
    } as unknown as IProduct;

    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: productWithImages, mode: 'Edit' }
    });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    // Primary image name is 'img1', should be first
    expect(images[0]).toHaveAttribute('alt', 'img1');
    expect(images[1]).toHaveAttribute('alt', 'img2');

    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('should show "Sem imagens" when product has no images', () => {
    const productNoImages = {
      ...mockSimpleProduct,
      allImages: []
    } as unknown as IProduct;

    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: productNoImages, mode: 'Edit' }
    });

    expect(screen.getByText('Sem imagens')).toBeInTheDocument();
  });

  it('should navigate to the correct step when clicking "Editar"', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockVariableProduct, mode: 'Edit' }
    });

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    expect(editButtons).toHaveLength(3); // Basic info, Images, Variations

    // Click edit basic info
    await user.click(editButtons[0]);
    expect(mockGoToStep).toHaveBeenCalledWith(0); // BasicInfo index

    // Click edit images
    await user.click(editButtons[1]);
    expect(mockGoToStep).toHaveBeenCalledWith(1); // Images index

    // Click edit variations
    await user.click(editButtons[2]);
    expect(mockGoToStep).toHaveBeenCalledWith(2); // Variations index
  });
});
