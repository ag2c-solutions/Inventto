import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Verifica se existe um ambiente DOM (jsdom ou happy-dom) ativo
if (typeof globalThis.HTMLElement !== 'undefined') {
  const ResizeObserverMock = class {
    constructor(_: ResizeObserverCallback) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  const IntersectionObserverMock = class {
    constructor(_: IntersectionObserverCallback) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  };

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

  if (!globalThis.matchMedia) {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  }

  globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();
}
