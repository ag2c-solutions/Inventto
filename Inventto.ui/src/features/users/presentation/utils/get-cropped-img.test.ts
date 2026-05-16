import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PixelCrop } from '../../domain/entities';

import { getCroppedImg } from './get-cropped-img';

vi.mock('./create-image', () => ({
  createImage: vi.fn()
}));

import { createImage } from './create-image';

const makeMockImage = (): HTMLImageElement => ({}) as HTMLImageElement;

const makePixelCrop = (overrides?: Partial<PixelCrop>): PixelCrop => ({
  x: 10,
  y: 20,
  width: 100,
  height: 80,
  ...overrides
});

describe('getCroppedImg', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar um File do tipo image/jpeg quando o recorte for bem-sucedido', async () => {
    vi.mocked(createImage).mockResolvedValue(makeMockImage());

    const mockBlob = new Blob(['image-data'], { type: 'image/jpeg' });
    const mockCtx = {
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback) => callback(mockBlob)),
      width: 0,
      height: 0
    } as unknown as HTMLCanvasElement);

    const result = await getCroppedImg(
      'https://example.com/image.png',
      makePixelCrop()
    );

    expect(result).toBeInstanceOf(File);
    expect((result as File).type).toBe('image/jpeg');
  });

  it('deve retornar null quando o contexto 2D do canvas não estiver disponível', async () => {
    vi.mocked(createImage).mockResolvedValue(makeMockImage());

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(null),
      width: 0,
      height: 0
    } as unknown as HTMLCanvasElement);

    const result = await getCroppedImg(
      'https://example.com/image.png',
      makePixelCrop()
    );

    expect(result).toBeNull();
  });

  it('deve retornar null quando o toBlob produzir um blob nulo', async () => {
    vi.mocked(createImage).mockResolvedValue(makeMockImage());

    const mockCtx = {
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback) => callback(null)),
      width: 0,
      height: 0
    } as unknown as HTMLCanvasElement);

    const result = await getCroppedImg(
      'https://example.com/image.png',
      makePixelCrop()
    );

    expect(result).toBeNull();
  });

  it('deve chamar drawImage com as coordenadas corretas do PixelCrop', async () => {
    const mockImage = makeMockImage();
    vi.mocked(createImage).mockResolvedValue(mockImage);

    const drawImage = vi.fn();
    const mockCtx = { drawImage } as unknown as CanvasRenderingContext2D;
    const mockBlob = new Blob(['image-data'], { type: 'image/jpeg' });

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback) => callback(mockBlob)),
      width: 0,
      height: 0
    } as unknown as HTMLCanvasElement);

    const pixelCrop = makePixelCrop({ x: 10, y: 20, width: 100, height: 80 });
    await getCroppedImg('https://example.com/image.png', pixelCrop);

    expect(drawImage).toHaveBeenCalledWith(
      mockImage,
      10,
      20,
      100,
      80,
      0,
      0,
      100,
      80
    );
  });

  it('deve nomear o arquivo retornado como avatar-cropped.jpeg', async () => {
    vi.mocked(createImage).mockResolvedValue(makeMockImage());

    const mockBlob = new Blob(['image-data'], { type: 'image/jpeg' });
    const mockCtx = {
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback) => callback(mockBlob)),
      width: 0,
      height: 0
    } as unknown as HTMLCanvasElement);

    const result = await getCroppedImg(
      'https://example.com/image.png',
      makePixelCrop()
    );

    expect((result as File).name).toBe('avatar-cropped.jpeg');
  });
});
