import { BrowserRouter, useParams } from 'react-router';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storefrontFactory } from '../../../../tests/factories/storefront.factory';

const { mockUseStorefrontQuery, mockUseSaveStorefrontMutation } = vi.hoisted(
  () => ({
    mockUseStorefrontQuery: vi.fn(),
    mockUseSaveStorefrontMutation: vi.fn()
  })
);

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn()
  };
});

vi.mock('../../../hooks/use-queries', () => ({
  useStorefrontQuery: mockUseStorefrontQuery
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useSaveStorefrontMutation: mockUseSaveStorefrontMutation
}));

import { useStorefrontConfigForm } from './use-storefront-config-form';

function renderConfigForm() {
  return renderHook(() => useStorefrontConfigForm(), {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
  });
}

describe('useStorefrontConfigForm', () => {
  const mockSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSaveStorefrontMutation.mockReturnValue({
      mutateAsync: mockSave,
      isPending: false
    });
  });

  describe('create mode (/storefronts/novo)', () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ storefrontId: undefined });
      mockUseStorefrontQuery.mockReturnValue({ data: undefined });
    });

    it('should report isCreate=true and no storefront name/state', () => {
      const { result } = renderConfigForm();

      expect(result.current.isCreate).toBe(true);
      expect(result.current.storefrontName).toBe('');
      expect(result.current.storefrontState).toBeUndefined();
    });

    it('should not show the action bar without changes', () => {
      const { result } = renderConfigForm();

      expect(result.current.showActionBar).toBe(false);
    });

    it('should show the action bar once a field is dirtied', () => {
      const { result } = renderConfigForm();

      act(() => {
        result.current.form.setValue('name', 'Vitrine Nova', {
          shouldDirty: true
        });
      });

      expect(result.current.showActionBar).toBe(true);
    });

    it('should call save with the storefront id undefined', async () => {
      mockSave.mockResolvedValue('new-id');
      const { result } = renderConfigForm();

      act(() => {
        result.current.form.setValue('name', 'Vitrine Nova', {
          shouldDirty: true
        });
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockSave).toHaveBeenCalledWith({
        id: undefined,
        values: expect.objectContaining({ name: 'Vitrine Nova' })
      });
    });
  });

  describe('edit mode (/storefronts/:id)', () => {
    const storefront = storefrontFactory.build({
      id: 's1',
      name: 'Vitrine Ateliê Joana',
      slug: 'atelie-joana',
      state: 'live'
    });

    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ storefrontId: 's1' });
      mockUseStorefrontQuery.mockReturnValue({ data: storefront });
    });

    it('should report isCreate=false and load the storefront name/state', () => {
      const { result } = renderConfigForm();

      expect(result.current.isCreate).toBe(false);
      expect(result.current.storefrontName).toBe('Vitrine Ateliê Joana');
      expect(result.current.storefrontState).toBe('live');
    });

    it('should reset the form with the loaded storefront values', () => {
      const { result } = renderConfigForm();

      expect(result.current.form.getValues('name')).toBe(
        'Vitrine Ateliê Joana'
      );
      expect(result.current.form.getValues('slug')).toBe(storefront.slug);
    });

    it('Descartar should revert the loaded values and hide the action bar', () => {
      const { result } = renderConfigForm();

      act(() => {
        result.current.form.setValue('name', 'Outro nome', {
          shouldDirty: true
        });
      });
      expect(result.current.showActionBar).toBe(true);

      act(() => {
        result.current.onDiscard();
      });

      expect(result.current.form.getValues('name')).toBe(
        'Vitrine Ateliê Joana'
      );
      expect(result.current.showActionBar).toBe(false);
    });

    it('should call save with the storefront id', async () => {
      mockSave.mockResolvedValue('s1');
      const { result } = renderConfigForm();

      act(() => {
        result.current.form.setValue('name', 'Novo nome', {
          shouldDirty: true
        });
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockSave).toHaveBeenCalledWith({
        id: 's1',
        values: expect.objectContaining({ name: 'Novo nome' })
      });
    });
  });
});
