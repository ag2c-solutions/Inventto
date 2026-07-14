// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudinaryService } from './index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFakeFile(name = 'avatar.png', type = 'image/png'): File {
  return new File(['(binary)'], name, { type });
}

function mockFetchOk(dto: object): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(dto)
    })
  );
}

function mockFetchError(status: number, errorMessage?: string): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: vi
        .fn()
        .mockResolvedValue(
          errorMessage ? { error: { message: errorMessage } } : {}
        )
    })
  );
}

function mockFetchNetworkFailure(message = 'Network error'): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(message)));
}

// ─── uploadImage ──────────────────────────────────────────────────────────────

describe('CloudinaryService.uploadImage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve retornar publicId e url quando o upload é bem-sucedido', async () => {
    mockFetchOk({
      public_id: 'users/avatar-123',
      secure_url:
        'https://res.cloudinary.com/my-cloud/image/upload/users/avatar-123.png'
    });

    const result = await CloudinaryService.uploadImage(makeFakeFile());

    expect(result.publicId).toBe('users/avatar-123');
    expect(result.url).toBe(
      'https://res.cloudinary.com/my-cloud/image/upload/users/avatar-123.png'
    );
  });

  it('deve enviar o arquivo no FormData com os campos corretos', async () => {
    mockFetchOk({
      public_id: 'abc',
      secure_url: 'https://example.com/abc.png'
    });

    const file = makeFakeFile('photo.jpg', 'image/jpeg');
    await CloudinaryService.uploadImage(file);

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = init?.body as FormData;

    // jsdom serializa File como '[object File]' ao ler do FormData
    expect(String(body.get('file'))).toBe('[object File]');
    expect(body.get('upload_preset')).toBeTruthy();
  });

  it('deve lançar erro com a mensagem da API quando a resposta não é ok e há body de erro', async () => {
    mockFetchError(400, 'Invalid upload preset');

    await expect(CloudinaryService.uploadImage(makeFakeFile())).rejects.toThrow(
      'Falha no upload: Invalid upload preset'
    );
  });

  it('deve lançar erro com status HTTP quando a resposta não é ok e não há body de erro', async () => {
    mockFetchError(500);

    await expect(CloudinaryService.uploadImage(makeFakeFile())).rejects.toThrow(
      'Falha no upload: Erro HTTP: 500'
    );
  });

  it('deve lançar erro quando a requisição de rede falha', async () => {
    mockFetchNetworkFailure('Failed to fetch');

    await expect(CloudinaryService.uploadImage(makeFakeFile())).rejects.toThrow(
      'Falha no upload: Failed to fetch'
    );
  });

  it('deve lançar erro genérico quando o throw não é uma instância de Error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('string error'));

    await expect(CloudinaryService.uploadImage(makeFakeFile())).rejects.toThrow(
      'Erro desconhecido no upload de imagem'
    );
  });
});

// ─── createThumbnail ──────────────────────────────────────────────────────────

describe('CloudinaryService.createThumbnail', () => {
  it('deve retornar string vazia quando publicId é null', () => {
    const url = CloudinaryService.createThumbnail(null, {
      width: 100,
      height: 100
    });
    expect(url).toBe('');
  });

  it('deve retornar string vazia quando publicId é undefined', () => {
    const url = CloudinaryService.createThumbnail(undefined, {
      width: 100,
      height: 100
    });
    expect(url).toBe('');
  });

  it('deve retornar string vazia quando publicId é string vazia', () => {
    const url = CloudinaryService.createThumbnail('', {
      width: 100,
      height: 100
    });
    expect(url).toBe('');
  });

  it('deve retornar uma URL quando publicId é válido', () => {
    const url = CloudinaryService.createThumbnail('users/avatar-123', {
      width: 200,
      height: 200
    });

    expect(url).toBeTypeOf('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('deve incluir o publicId na URL gerada', () => {
    const url = CloudinaryService.createThumbnail('users/avatar-123', {
      width: 200,
      height: 200
    });

    expect(url).toContain('avatar-123');
  });

  it('deve usar quality padrão de 80 quando não fornecida', () => {
    const urlWithDefault = CloudinaryService.createThumbnail('users/abc', {
      width: 100,
      height: 100
    });

    const urlWithExplicit = CloudinaryService.createThumbnail('users/abc', {
      width: 100,
      height: 100,
      quality: 80
    });

    expect(urlWithDefault).toBe(urlWithExplicit);
  });

  it('deve gerar URLs diferentes para qualidades diferentes', () => {
    const url80 = CloudinaryService.createThumbnail('users/abc', {
      width: 100,
      height: 100,
      quality: 80
    });

    const url50 = CloudinaryService.createThumbnail('users/abc', {
      width: 100,
      height: 100,
      quality: 50
    });

    expect(url80).not.toBe(url50);
  });

  it('deve gerar URLs diferentes para dimensões diferentes', () => {
    const url200 = CloudinaryService.createThumbnail('users/abc', {
      width: 200,
      height: 200
    });

    const url100 = CloudinaryService.createThumbnail('users/abc', {
      width: 100,
      height: 100
    });

    expect(url200).not.toBe(url100);
  });
});
