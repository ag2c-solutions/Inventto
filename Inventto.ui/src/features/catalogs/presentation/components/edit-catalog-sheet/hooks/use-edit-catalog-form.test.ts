import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useEditCatalogForm } from './use-edit-catalog-form';

describe('useEditCatalogForm', () => {
  it('should start with an empty name when none is provided', () => {
    const { result } = renderHook(() => useEditCatalogForm());

    expect(result.current.getValues('name')).toBe('');
  });

  it('should sync the form when the catalog name becomes available', async () => {
    const { result, rerender } = renderHook(
      ({ name }: { name?: string }) => useEditCatalogForm(name),
      { initialProps: { name: undefined as string | undefined } }
    );

    expect(result.current.getValues('name')).toBe('');

    rerender({ name: 'Catálogo Verão' });

    await waitFor(() =>
      expect(result.current.getValues('name')).toBe('Catálogo Verão')
    );
  });
});
