import { useCallback } from 'react';

import { LocalStorageService } from '@/infra/local-storage';

export function useLocalStorage() {
  const getItem = useCallback(
    <T>(key: string) => LocalStorageService.getItem<T>(key),
    []
  );

  const setItem = useCallback(
    <T>(key: string, value: T) => LocalStorageService.setItem(key, value),
    []
  );

  const removeItem = useCallback(
    (key: string) => LocalStorageService.removeItem(key),
    []
  );

  return { getItem, setItem, removeItem };
}
