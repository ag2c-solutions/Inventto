import { useEffect } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IProductImage } from '../../../../../domain/entities';
import type { ProductFormProviderProps } from '../../hook';
import { useProductForm } from '../../hook';
import { mockFormData, renderWithProductProvider } from '../../mocks';

import { ProductFormFieldImages } from './field-product-images';

const mocks = vi.hoisted(() => ({
  FilePicker: vi.fn((props) => (
    <div data-testid="mock-file-picker">{props.children}</div>
  ))
}));

vi.mock('@/shared/components/common/file-picker', () => ({
  FilePicker: mocks.FilePicker,
  FilePickerInput: () => <div data-testid="fp-input" />,
  FilePickerDrag: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-drag">{children}</div>
  ),
  FilePickerHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-header">{children}</div>
  ),
  FilePickerCount: ({ label }: { label: string }) => (
    <div data-testid="fp-count">{label}</div>
  ),
  FilePickerAddMoreButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
  FilePickerRemoveAllButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
  FilePickerEmpty: ({ children }: { children: ReactNode }) => (
    <div data-testid="fp-empty">{children}</div>
  ),
  FilePickerButton: ({ label }: { label: string }) => <button>{label}</button>,
  FilePickerContent: () => <div data-testid="fp-content" />,
  FilePickerError: () => <div data-testid="fp-error" />
}));

describe('ProductFormFieldImages (Integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the FilePicker with the correct props and an empty state', () => {
    renderWithProductProvider(<ProductFormFieldImages />);

    expect(screen.getByTestId('mock-file-picker')).toBeInTheDocument();
    expect(
      screen.getByText('Solte a imagem dos produtos aqui')
    ).toBeInTheDocument();
    expect(screen.getByText('Selecionar imagens')).toBeInTheDocument();

    const pastProps = mocks.FilePicker.mock.calls[0][0];

    expect(pastProps).toEqual(
      expect.objectContaining({
        files: [],
        maxFiles: 10,
        maxSizeMB: 5,
        accept: 'image/png,image/jpeg,image/jpg',
        onFilesChange: expect.any(Function)
      })
    );
  });

  it('must pass the form files (populated state) to the FilePicker', () => {
    const mockImages: IProductImage[] = [
      {
        id: 'img1',
        name: 'image.png',
        url: 'blob:url',
        type: 'image/png',
        isPrimary: true
      }
    ];
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        ...mockFormData,
        allImages: mockImages,
        hasVariants: false
      } as never
    };

    renderWithProductProvider(<ProductFormFieldImages />, { providerProps });

    const pastProps = mocks.FilePicker.mock.calls[0][0];

    expect(pastProps).toEqual(
      expect.objectContaining({
        files: mockImages,
        maxFiles: 10,
        maxSizeMB: 5,
        accept: 'image/png,image/jpeg,image/jpg',
        onFilesChange: expect.any(Function)
      })
    );
  });

  it('should use fallback empty array if form value becomes undefined', async () => {
    const TestComponent = () => {
      const { form } = useProductForm();

      useEffect(() => {
        form.setValue('allImages', undefined as never);
      }, [form]);

      return <ProductFormFieldImages />;
    };

    renderWithProductProvider(<TestComponent />);

    await waitFor(() => {
      expect(mocks.FilePicker).toHaveBeenLastCalledWith(
        expect.objectContaining({
          files: []
        }),
        undefined
      );
    });
  });

  it('The form should be updated when the FilePicker`s onFilesChange event is called', () => {
    const { rerender } = renderWithProductProvider(<ProductFormFieldImages />);
    const onFilesChange = mocks.FilePicker.mock.calls[0][0].onFilesChange;
    const newFiles = [{ id: 'new-img', name: 'new.png', size: 100 }];

    act(() => {
      onFilesChange(newFiles);
    });

    rerender(<ProductFormFieldImages />);

    const lastPastProps = mocks.FilePicker.mock.lastCall?.[0];

    expect(lastPastProps).toEqual(
      expect.objectContaining({
        files: newFiles
      })
    );
  });
});
