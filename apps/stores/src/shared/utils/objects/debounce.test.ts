import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve chamar a função apenas uma vez após o período de espera quando invocada múltiplas vezes rapidamente', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deve resetar o timer a cada nova chamada antes do período expirar', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);

    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deve executar a função com os argumentos corretos da última chamada', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('primeiro');
    debounced('segundo');
    debounced('terceiro');

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('terceiro');
  });

  it('deve permitir chamadas independentes após o debounce ter disparado', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(300);

    debounced();
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
