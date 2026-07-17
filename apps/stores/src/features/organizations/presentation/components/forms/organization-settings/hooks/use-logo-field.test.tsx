import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  defaultSettingsValues,
  type OrganizationSettingsFormData
} from '../schema';

import { useLogoField } from './use-logo-field';

function setup() {
  return renderHook(() => {
    const form = useForm<OrganizationSettingsFormData>({
      defaultValues: defaultSettingsValues
    });
    const logo = useLogoField(form);
    // ler isDirty no render assina o proxy do formState do RHF
    return { form, logo, isDirty: form.formState.isDirty };
  });
}

describe('useLogoField', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preview indefinido enquanto não há arquivo selecionado', () => {
    const { result } = setup();

    expect(result.current.logo.logoPreview).toBeUndefined();
  });

  it('faz stage do arquivo no form e gera o preview via object URL', () => {
    const { result } = setup();
    const file = new File(['x'], 'logo.png', { type: 'image/png' });

    act(() => result.current.logo.handleLogoChange(file));

    expect(result.current.form.getValues('identity.logoFile')).toBe(file);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.logo.logoPreview).toBe('blob:logo');
  });
});
