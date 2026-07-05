import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseLogoChange } = vi.hoisted(() => ({
  mockUseLogoChange: vi.fn()
}));

vi.mock('./hooks/use-logo-change', () => ({
  useLogoChange: mockUseLogoChange
}));

import { LogoChange } from '.';

const baseHookReturn = {
  files: [] as { id: string; url: string }[],
  crop: { x: 0, y: 0 },
  zoom: 1,
  isSubmitting: false,
  setFiles: vi.fn(),
  setCrop: vi.fn(),
  setZoom: vi.fn(),
  onCropComplete: vi.fn(),
  handleSave: vi.fn(),
  reset: vi.fn()
};

describe('LogoChange', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogoChange.mockReturnValue({ ...baseHookReturn });
  });

  it('abre o modal de upload ao clicar em "Trocar logo"', async () => {
    render(<LogoChange onLogoChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Trocar logo/ }));

    expect(
      screen.getByRole('dialog', { name: 'Logo da loja' })
    ).toBeInTheDocument();
    expect(screen.getByText('Carregar logo')).toBeInTheDocument();
  });

  it('chama reset ao clicar em Cancelar (sem arquivo selecionado)', async () => {
    const reset = vi.fn();
    mockUseLogoChange.mockReturnValue({ ...baseHookReturn, reset });

    render(<LogoChange onLogoChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Trocar logo/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // O clique dispara tanto o onClick do botão quanto o onOpenChange do
    // Dialog (fechamento via DialogClose) — ambos os caminhos já existiam
    // antes desta cobertura.
    expect(reset).toHaveBeenCalled();
  });

  it('exibe o cropper e o slider de zoom quando há arquivo selecionado', async () => {
    mockUseLogoChange.mockReturnValue({
      ...baseHookReturn,
      files: [{ id: 'f1', url: 'blob:preview' }]
    });

    render(<LogoChange onLogoChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Trocar logo/ }));

    expect(
      screen.getByText('Arraste e zoom para ajustar a miniatura da logo.')
    ).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('chama handleSave ao clicar em "Salvar Logo" (caminho feliz)', async () => {
    const handleSave = vi.fn();
    mockUseLogoChange.mockReturnValue({
      ...baseHookReturn,
      files: [{ id: 'f1', url: 'blob:preview' }],
      handleSave
    });

    render(<LogoChange onLogoChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Trocar logo/ }));
    await user.click(screen.getByRole('button', { name: 'Salvar Logo' }));

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('chama reset ao clicar em "Trocar Imagem" (caminho de correção)', async () => {
    const reset = vi.fn();
    mockUseLogoChange.mockReturnValue({
      ...baseHookReturn,
      files: [{ id: 'f1', url: 'blob:preview' }],
      reset
    });

    render(<LogoChange onLogoChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Trocar logo/ }));
    await user.click(screen.getByRole('button', { name: 'Trocar Imagem' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('desabilita o gatilho quando disabled é true', () => {
    render(<LogoChange onLogoChange={vi.fn()} disabled />);

    expect(screen.getByRole('button', { name: /Trocar logo/ })).toBeDisabled();
  });
});
