import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

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

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
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

window.HTMLElement.prototype.scrollIntoView = vi.fn();
