import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../utils/get-cropped-img', () => ({
  getCroppedImg: vi.fn()
}));

import { fileWithPreviewFactory } from '../../../../../tests/factories/file-with-preview.factory';
import { getCroppedImg } from '../../../../utils/get-cropped-img';

import { useLogoChange } from './use-logo-change';

describe('useLogoChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicia sem arquivos, zoom 1 e crop zerado', () => {
    const { result } = renderHook(() =>
      useLogoChange({ onLogoChange: vi.fn() })
    );

    expect(result.current.files).toEqual([]);
    expect(result.current.zoom).toBe(1);
    expect(result.current.crop).toEqual({ x: 0, y: 0 });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleSave não faz nada sem arquivo selecionado', async () => {
    const onLogoChange = vi.fn();
    const { result } = renderHook(() => useLogoChange({ onLogoChange }));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(getCroppedImg).not.toHaveBeenCalled();
    expect(onLogoChange).not.toHaveBeenCalled();
  });

  it('faz o crop, chama onLogoChange e reseta o estado ao salvar (caminho feliz)', async () => {
    const croppedFile = new File(['cropped'], 'logo-cropped.jpeg');
    vi.mocked(getCroppedImg).mockResolvedValue(croppedFile);

    const onLogoChange = vi.fn();
    const onSaved = vi.fn();
    const { result } = renderHook(() =>
      useLogoChange({ onLogoChange, onSaved })
    );

    act(() => {
      result.current.setFiles([fileWithPreviewFactory.build()]);
      result.current.onCropComplete(undefined, {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(getCroppedImg).toHaveBeenCalledWith('blob:preview', {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    await waitFor(() => expect(onLogoChange).toHaveBeenCalledWith(croppedFile));
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(result.current.files).toEqual([]);
  });

  it('não chama onLogoChange nem onSaved quando o crop falha (caminho de falha)', async () => {
    vi.mocked(getCroppedImg).mockResolvedValue(null);

    const onLogoChange = vi.fn();
    const onSaved = vi.fn();
    const { result } = renderHook(() =>
      useLogoChange({ onLogoChange, onSaved })
    );

    act(() => {
      result.current.setFiles([fileWithPreviewFactory.build()]);
      result.current.onCropComplete(undefined, {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onLogoChange).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('reset limpa arquivos, crop, zoom e área recortada', () => {
    const { result } = renderHook(() =>
      useLogoChange({ onLogoChange: vi.fn() })
    );

    act(() => {
      result.current.setFiles([fileWithPreviewFactory.build()]);
      result.current.setZoom(2);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.zoom).toBe(1);
  });
});
