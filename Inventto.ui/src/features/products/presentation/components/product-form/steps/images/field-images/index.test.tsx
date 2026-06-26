import { useEffect } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

import type { IProductImage } from '../../../../../../domain/entities';
import type { ProductFormProviderProps } from '../../../hook';
import { useProductForm } from '../../../hook';
import { mockFormData, renderWithProductProvider } from '../../../mocks';

import { ProductFormFieldImages } from '.';

type MockContextReturn = [
  { files: FileWithPreview[]; errors: string[] },
  {
    addFiles: ReturnType<typeof vi.fn>;
    removeFile: ReturnType<typeof vi.fn>;
    setPrimaryFile: ReturnType<typeof vi.fn>;
    clearFiles: ReturnType<typeof vi.fn>;
    clearErrors: ReturnType<typeof vi.fn>;
    handleFileChange: ReturnType<typeof vi.fn>;
    openFileDialog: ReturnType<typeof vi.fn>;
    getInputProps: ReturnType<typeof vi.fn>;
  }
];

const makeContextMock = (files: FileWithPreview[] = []): MockContextReturn => [
  { files, errors: [] },
  {
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    setPrimaryFile: vi.fn(),
    clearFiles: vi.fn(),
    clearErrors: vi.fn(),
    handleFileChange: vi.fn(),
    openFileDialog: vi.fn(),
    getInputProps: vi.fn(() => ({ type: 'file', ref: null }))
  }
];

const mocks = vi.hoisted(() => ({
  FilePicker: vi.fn((props) => (
    <div data-testid="mock-file-picker">{props.children}</div>
  )),
  useFilePickerContext: vi.fn(),
  useDropzone: vi.fn(() => ({
    isDragging: false,
    dropzoneProps: {
      onDragEnter: vi.fn(),
      onDragLeave: vi.fn(),
      onDragOver: vi.fn(),
      onDrop: vi.fn()
    }
  }))
}));

vi.mock('@/shared/components/common/file-picker', () => ({
  FilePicker: mocks.FilePicker,
  FilePickerInput: () => <input data-testid="fp-input" type="file" />
}));

vi.mock('@/shared/components/common/file-picker/hooks', () => ({
  useFilePickerContext: mocks.useFilePickerContext
}));

vi.mock('@/shared/hooks/use-dropzone', () => ({
  useDropzone: mocks.useDropzone
}));

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId: string) => `https://cdn/${publicId}`)
  }
}));

const mockImages: FileWithPreview[] = [
  {
    id: 'img1',
    name: 'capa.png',
    url: 'blob:url1',
    type: 'image/png',
    isPrimary: true
  },
  {
    id: 'img2',
    name: 'other.png',
    url: 'blob:url2',
    type: 'image/png',
    isPrimary: false
  }
] satisfies IProductImage[];

describe('ProductFormFieldImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useFilePickerContext.mockReturnValue(makeContextMock());
  });

  it('should render the FilePicker with the correct props', () => {
    renderWithProductProvider(<ProductFormFieldImages />);

    const pastProps = mocks.FilePicker.mock.calls[0][0];

    expect(pastProps).toEqual(
      expect.objectContaining({
        files: [],
        maxFiles: 10,
        maxSizeMB: 5,
        accept: 'image/png,image/jpeg,image/jpg,image/webp'
      })
    );
  });

  it('should render the drop zone', () => {
    renderWithProductProvider(<ProductFormFieldImages />);

    expect(
      screen.getByText('Arraste imagens aqui ou clique para selecionar')
    ).toBeInTheDocument();
    expect(
      screen.getByText('PNG, JPG ou WEBP · upload múltiplo')
    ).toBeInTheDocument();
  });

  it('should not render image grid when there are no images', () => {
    renderWithProductProvider(<ProductFormFieldImages />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render image cards when there are images (without variants)', () => {
    mocks.useFilePickerContext.mockReturnValue(makeContextMock(mockImages));

    renderWithProductProvider(<ProductFormFieldImages />, {
      providerProps: {
        product: { ...mockFormData, hasVariants: false } as never
      }
    });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);

    // Star button visible for non-primary image
    expect(screen.getByLabelText('Definir como capa')).toBeInTheDocument();
    // Remove button for primary image (only X, no set-primary)
    expect(screen.getAllByLabelText('Remover imagem')).toHaveLength(2);

    expect(
      screen.getByText(
        'Passe o mouse em uma imagem para definir a capa (estrela) ou removê-la.'
      )
    ).toBeInTheDocument();
  });

  it('should render simple cards without action buttons when product has variants', () => {
    mocks.useFilePickerContext.mockReturnValue(makeContextMock(mockImages));

    renderWithProductProvider(<ProductFormFieldImages />, {
      providerProps: {
        product: { ...mockFormData, hasVariants: true } as never
      }
    });

    // Images still render
    expect(screen.getAllByRole('img')).toHaveLength(2);

    // No action buttons in simple mode
    expect(
      screen.queryByLabelText('Definir como capa')
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Remover imagem')).not.toBeInTheDocument();

    expect(
      screen.getByText(
        'Galeria do produto. A capa de cada variante é definida na etapa "Variações".'
      )
    ).toBeInTheDocument();
  });

  it('should call setPrimaryFile when clicking star button on a non-primary image', async () => {
    const mockSetPrimary = vi.fn();
    const user = userEvent.setup();

    const ctx = makeContextMock(mockImages);
    ctx[1].setPrimaryFile = mockSetPrimary;
    mocks.useFilePickerContext.mockReturnValue(ctx);

    renderWithProductProvider(<ProductFormFieldImages />, {
      providerProps: {
        product: { ...mockFormData, hasVariants: false } as never
      }
    });

    await user.click(screen.getByLabelText('Definir como capa'));
    expect(mockSetPrimary).toHaveBeenCalledWith('img2');
  });

  it('should call removeFile when clicking X button', async () => {
    const mockRemove = vi.fn();
    const user = userEvent.setup();

    const ctx = makeContextMock(mockImages);
    ctx[1].removeFile = mockRemove;
    mocks.useFilePickerContext.mockReturnValue(ctx);

    renderWithProductProvider(<ProductFormFieldImages />, {
      providerProps: {
        product: { ...mockFormData, hasVariants: false } as never
      }
    });

    // Click remove on primary (first) image
    const removeButtons = screen.getAllByLabelText('Remover imagem');
    await user.click(removeButtons[0]);
    expect(mockRemove).toHaveBeenCalledWith('img1');
  });

  it('should pass form images to FilePicker', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        ...mockFormData,
        allImages: mockImages,
        hasVariants: false
      } as never
    };

    renderWithProductProvider(<ProductFormFieldImages />, { providerProps });

    const pastProps = mocks.FilePicker.mock.calls[0][0];
    expect(pastProps.files).toEqual(mockImages);
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

  it('should update form when onFilesChange is called', () => {
    const { rerender } = renderWithProductProvider(<ProductFormFieldImages />);
    const onFilesChange = mocks.FilePicker.mock.calls[0][0].onFilesChange;
    const newFiles = [
      {
        id: 'new-img',
        name: 'new.png',
        url: 'blob:x',
        type: 'image/png',
        isPrimary: true
      }
    ];

    act(() => {
      onFilesChange(newFiles);
    });

    rerender(<ProductFormFieldImages />);

    const lastPastProps = mocks.FilePicker.mock.lastCall?.[0];
    expect(lastPastProps).toEqual(expect.objectContaining({ files: newFiles }));
  });
});
