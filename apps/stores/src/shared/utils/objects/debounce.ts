export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
