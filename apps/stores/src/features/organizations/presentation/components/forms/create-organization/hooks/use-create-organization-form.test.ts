import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateOrganizationForm } from './use-create-organization-form';

describe('useCreateOrganizationForm', () => {
  it('inicia com os valores padrão e todos os grupos de replicação marcados', () => {
    const { result } = renderHook(() => useCreateOrganizationForm());

    expect(result.current.form.getValues()).toEqual({
      name: '',
      document: '',
      copySettings: false,
      sourceOrgId: undefined,
      replicateGroups: ['categories', 'operational', 'visual']
    });
    expect(result.current.copySettings).toBe(false);
  });

  it('aplica a máscara de documento via handleDocumentChange', () => {
    const { result } = renderHook(() => useCreateOrganizationForm());

    act(() => {
      result.current.handleDocumentChange('12345678000190');
    });

    expect(result.current.form.getValues('document')).toBe(
      '12.345.678/0001-90'
    );
  });

  it('handleCopySettingsToggle(true) habilita copySettings', () => {
    const { result } = renderHook(() => useCreateOrganizationForm());

    act(() => {
      result.current.handleCopySettingsToggle(true);
    });

    expect(result.current.form.getValues('copySettings')).toBe(true);
  });

  it('handleCopySettingsToggle(false) limpa sourceOrgId e restaura todos os grupos', () => {
    const { result } = renderHook(() => useCreateOrganizationForm());

    act(() => {
      result.current.form.setValue('sourceOrgId', 'org-99');
      result.current.form.setValue('replicateGroups', ['categories']);
    });

    act(() => {
      result.current.handleCopySettingsToggle(false);
    });

    expect(result.current.form.getValues('sourceOrgId')).toBeUndefined();
    expect(result.current.form.getValues('replicateGroups')).toEqual([
      'categories',
      'operational',
      'visual'
    ]);
  });

  it('handleCancel reseta o formulário e chama onCancel', () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useCreateOrganizationForm({ onCancel })
    );

    act(() => {
      result.current.form.setValue('name', 'Alterado');
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.form.getValues('name')).toBe('');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('expõe onSuccess recebido nas props', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useCreateOrganizationForm({ onSuccess })
    );

    expect(result.current.onSuccess).toBe(onSuccess);
  });
});
