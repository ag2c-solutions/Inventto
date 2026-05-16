import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarProps
} from '@radix-ui/react-avatar';
import type { SliderProps } from '@radix-ui/react-slider';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import type Cropper from 'react-easy-crop';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

import { useAvatarChange } from './hook';
import { AvatarChange } from './index';

const { mockedUseUpdateAvatarMutation, mockedUseUser } = vi.hoisted(() => {
  return {
    mockedUseUpdateAvatarMutation: vi.fn(),
    mockedUseUser: vi.fn()
  };
});

vi.mock('../../hooks/use-mutation', () => ({
  useUpdateAvatarMutation: mockedUseUpdateAvatarMutation
}));

vi.mock('../../hooks/use-user', () => ({
  useUser: mockedUseUser
}));

vi.mock('../../utils/get-cropped-img', () => ({
  getCroppedImg: vi
    .fn()
    .mockResolvedValue(
      new File(['content'], 'avatar.png', { type: 'image/png' })
    )
}));

vi.mock('@/shared/components/ui/avatar', () => ({
  Avatar: ({ children, className }: AvatarProps) => (
    <div className={className}>{children}</div>
  ),

  AvatarImage: ({ src, className }: AvatarImageProps) => (
    <img src={src} className={className} alt="Avatar do usuário" />
  ),

  AvatarFallback: ({ children }: AvatarFallbackProps) => <div>{children}</div>
}));

vi.mock('@/shared/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max }: SliderProps) => (
    <input
      data-testid="mock-slider"
      type="range"
      min={min}
      max={max}
      step={0.1}
      value={value?.[0] ?? 1}
      onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
    />
  )
}));

vi.mock('react-easy-crop', () => ({
  default: vi.fn(
    ({ onCropChange, onCropComplete }: ComponentProps<typeof Cropper>) => (
      <div data-testid="mock-cropper">
        <button
          type="button"
          onClick={() => {
            onCropChange({ x: 10, y: 10 });
            onCropComplete?.(
              { x: 10, y: 10, width: 100, height: 100 },
              { x: 10, y: 10, width: 200, height: 200 }
            );
          }}
        >
          Simulate Crop
        </button>
      </div>
    )
  )
}));

window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe('AvatarChange Feature', () => {
  const user = userEvent.setup();
  const mockMutate = vi.fn();
  const defaultUser = {
    id: 'user-123',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseUser.mockReturnValue({
      user: defaultUser
    });

    mockedUseUpdateAvatarMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      status: 'idle',
      data: undefined,
      error: null,
      reset: vi.fn()
    });
  });

  const openDialog = async () => {
    await user.click(screen.getByRole('button'));
  };

  const selectFile = async () => {
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload image file/i);

    await user.upload(input, file);

    return file;
  };

  describe('Integration Tests (Component UI)', () => {
    describe('Estado Inicial', () => {
      it('deve renderizar o avatar atual do usuário', async () => {
        render(<AvatarChange />);

        await openDialog();

        const avatarImage = await screen.findByRole('img');

        expect(avatarImage).toHaveAttribute('src', defaultUser.avatarUrl);
      });

      it('deve mostrar o botão de upload inicialmente', async () => {
        render(<AvatarChange />);

        await openDialog();

        expect(await screen.findByText(/carregar foto/i)).toBeInTheDocument();
      });
    });

    describe('Fluxo de Seleção e Edição', () => {
      it('deve exibir o Cropper após selecionar um arquivo', async () => {
        render(<AvatarChange />);

        await openDialog();
        await selectFile();

        expect(await screen.findByTestId('mock-cropper')).toBeInTheDocument();
        expect(
          screen.getByText(
            /Arraste e zoom para ajustar a miniatura do perfil./i
          )
        ).toBeInTheDocument();
      });

      it('deve limpar o arquivo ao clicar em Trocar Imagem', async () => {
        render(<AvatarChange />);

        await openDialog();
        await selectFile();

        const secondaryBtn = await screen.findByText(/trocar imagem/i);

        await user.click(secondaryBtn);

        expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
      });

      it('deve atualizar o zoom via slider', async () => {
        render(<AvatarChange />);

        await openDialog();
        await selectFile();

        const slider = await screen.findByTestId('mock-slider');

        fireEvent.change(slider, { target: { value: '2' } });

        expect(slider).toHaveValue('2');
      });
    });

    describe('Fluxo de Salvamento (Submit)', () => {
      it('deve disparar a mutation com os dados corretos ao salvar', async () => {
        render(<AvatarChange />);

        await openDialog();
        await selectFile();

        const cropBtn = await screen.findByText('Simulate Crop');

        await user.click(cropBtn);

        const saveBtn = screen.getByRole('button', { name: /salvar avatar/i });

        await user.click(saveBtn);

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith({
          userId: defaultUser.id,
          file: expect.any(File)
        });
      });

      it('não deve salvar se as coordenadas de corte não estiverem definidas', async () => {
        vi.mocked((await import('react-easy-crop')).default).mockImplementation(
          () => <div data-testid="dumb-cropper" />
        );

        render(<AvatarChange />);

        await openDialog();
        await selectFile();
        await screen.findByTestId('dumb-cropper');

        const saveBtn = screen.getByRole('button', { name: /salvar avatar/i });

        await user.click(saveBtn);

        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    describe('Estado de Loading', () => {
      it('deve desabilitar botões enquanto a mutation está pendente', async () => {
        mockedUseUpdateAvatarMutation.mockReturnValue({
          mutate: mockMutate,
          isPending: true,
          status: 'pending'
        });

        render(<AvatarChange />);

        await openDialog();

        const cancelBtn = await screen.findByText(/cancelar/i);

        expect(cancelBtn.closest('button')).toBeDisabled();
      });
    });
  });

  describe('Unit Tests (Hook Logic)', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useAvatarChange());

      expect(result.current.files).toEqual([]);
      expect(result.current.zoom).toBe(1);
    });

    describe('Guard Clauses (handleSave)', () => {
      it('não deve salvar se não houver usuário logado', async () => {
        mockedUseUser.mockReturnValue({ user: null });

        const { result } = renderHook(() => useAvatarChange());

        await act(async () => {
          await result.current.handleSave();
        });

        expect(mockMutate).not.toHaveBeenCalled();
      });

      it('não deve salvar se não houver arquivo selecionado', async () => {
        const { result } = renderHook(() => useAvatarChange());

        await act(async () => {
          await result.current.handleSave();
        });

        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    describe('handleSave', () => {
      it('deve chamar mutate com userId e File ao salvar', async () => {
        const { result } = renderHook(() => useAvatarChange());

        act(() => {
          result.current.setFiles([{ url: 'blob:file' } as FileWithPreview]);
          result.current.onCropComplete(
            {},
            {
              width: 100,
              height: 100,
              x: 0,
              y: 0
            }
          );
        });

        await act(async () => {
          await result.current.handleSave();
        });

        expect(mockMutate).toHaveBeenCalledWith({
          userId: defaultUser.id,
          file: expect.any(File)
        });
      });
    });
  });
});
