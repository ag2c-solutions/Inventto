import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalStorageService } from '@/infra/local-storage';

import { useLocalStorage } from '.';

vi.mock('@/infra/local-storage', () => ({
  LocalStorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate getItem to LocalStorageService', () => {
    vi.mocked(LocalStorageService.getItem).mockReturnValue('org-1');

    const { result } = renderHook(() => useLocalStorage());
    const value = result.current.getItem<string>('key');

    expect(LocalStorageService.getItem).toHaveBeenCalledWith('key');
    expect(value).toBe('org-1');
  });

  it('should delegate setItem to LocalStorageService', () => {
    const { result } = renderHook(() => useLocalStorage());

    result.current.setItem('key', 'org-1');

    expect(LocalStorageService.setItem).toHaveBeenCalledWith('key', 'org-1');
  });

  it('should delegate removeItem to LocalStorageService', () => {
    const { result } = renderHook(() => useLocalStorage());

    result.current.removeItem('key');

    expect(LocalStorageService.removeItem).toHaveBeenCalledWith('key');
  });
});
