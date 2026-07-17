import { useCheckSlugQuery } from '../../../hooks/use-queries';

export type SlugFieldState =
  | 'idle'
  | 'checking'
  | 'ok'
  | 'taken'
  | 'invalid'
  | 'reserved';

// RN072: validação assíncrona do slug — debounce e "isSettled" já vêm de
// useCheckSlugQuery (shared/hooks/use-debounced-value por baixo).
export function useSlugAvailability(
  slug: string,
  storefrontId?: string
): SlugFieldState {
  const trimmed = slug.trim();
  const { data, isSettled } = useCheckSlugQuery(trimmed, storefrontId);

  if (!trimmed) return 'idle';
  if (trimmed.length < 3) return 'invalid';
  if (!isSettled || !data) return 'checking';

  return data.available ? 'ok' : data.reason;
}
