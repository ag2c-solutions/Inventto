import { afterEach, describe, expect, it, vi } from 'vitest';

import { createImage } from './create-image';

describe('createImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve resolver com um HTMLImageElement quando a imagem carregar com sucesso', async () => {
    const listeners: Record<string, () => void> = {};

    const img = {
      addEventListener: vi.fn((event: string, handler: () => void) => {
        listeners[event] = handler;
      }),
      setAttribute: vi.fn(),
      set src(_url: string) {
        listeners['load']?.();
      }
    };

    vi.stubGlobal('Image', function (this: unknown) {
      return img;
    });

    const result = await createImage('https://example.com/image.png');

    expect(result).toBe(img);
  });

  it('deve rejeitar a promise quando a imagem falhar ao carregar', async () => {
    const fakeError = new Event('error');
    const listeners: Record<string, (e?: Event) => void> = {};

    const img = {
      addEventListener: vi.fn((event: string, handler: (e?: Event) => void) => {
        listeners[event] = handler;
      }),
      setAttribute: vi.fn(),
      set src(_url: string) {
        listeners['error']?.(fakeError);
      }
    };

    vi.stubGlobal('Image', function (this: unknown) {
      return img;
    });

    await expect(createImage('https://example.com/broken.png')).rejects.toBe(
      fakeError
    );
  });

  it('deve definir o atributo crossOrigin como anonymous antes de atribuir o src, garantindo que a ordem das operações está correta', async () => {
    const callOrder: string[] = [];
    const listeners: Record<string, () => void> = {};

    const img = {
      addEventListener: vi.fn((event: string, handler: () => void) => {
        listeners[event] = handler;
      }),
      setAttribute: vi.fn((_attr: string, _value: string) => {
        callOrder.push('setAttribute');
      }),
      set src(_url: string) {
        callOrder.push('src');
        listeners['load']?.();
      }
    };

    vi.stubGlobal('Image', function (this: unknown) {
      return img;
    });

    await createImage('https://example.com/image.png');

    expect(callOrder.indexOf('setAttribute')).toBeLessThan(
      callOrder.indexOf('src')
    );
  });
});
