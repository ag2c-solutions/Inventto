import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

// happy-dom não expõe WebSocket no seu globalThis simulado, e o
// @supabase/realtime-js lança erro na construção do client se não achar
// nenhum. Nenhum teste usa realtime de fato, então um stub basta.
if (typeof globalThis.WebSocket === 'undefined') {
  class WebSocketMock {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    close = vi.fn();
    send = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
  }

  vi.stubGlobal('WebSocket', WebSocketMock);
}

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
