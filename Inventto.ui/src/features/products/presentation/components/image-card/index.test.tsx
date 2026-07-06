import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fileWithPreviewFactory } from '../../../tests/factories/file-with-preview.factory';

const { mockCreateThumbnail } = vi.hoisted(() => ({
  mockCreateThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
}));

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: mockCreateThumbnail
  }
}));

import { ImageCard } from '.';

describe('ImageCard', () => {
  const onSetPrimary = vi.fn();
  const onRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a Cloudinary thumbnail when publicId is usable', () => {
    const file = fileWithPreviewFactory.build({ publicId: 'products/abc' });

    render(
      <ImageCard
        file={file}
        showActions={false}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    expect(mockCreateThumbnail).toHaveBeenCalledWith('products/abc', {
      width: 300,
      height: 300,
      quality: 90
    });
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'thumb/products/abc'
    );
  });

  it('should render the raw file url when publicId is a mock', () => {
    const file = fileWithPreviewFactory.build({
      publicId: 'mock-123',
      url: 'blob:preview'
    });

    render(
      <ImageCard
        file={file}
        showActions={false}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    expect(mockCreateThumbnail).not.toHaveBeenCalled();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:preview');
  });

  it('should show the primary indicator when the file is primary', () => {
    const file = fileWithPreviewFactory.build({ isPrimary: true });

    render(
      <ImageCard
        file={file}
        showActions={false}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should not render action buttons when showActions is false', () => {
    const file = fileWithPreviewFactory.build();

    render(
      <ImageCard
        file={file}
        showActions={false}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    expect(
      screen.queryByRole('button', { name: /remover imagem/i })
    ).not.toBeInTheDocument();
  });

  it('should call onSetPrimary and onRemove for a non-primary file when actions are visible', async () => {
    const user = userEvent.setup();
    const file = fileWithPreviewFactory.build({
      id: 'img-1',
      isPrimary: false
    });

    render(
      <ImageCard
        file={file}
        showActions
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /definir como capa/i })
    );
    expect(onSetPrimary).toHaveBeenCalledWith('img-1');

    await user.click(screen.getByRole('button', { name: /remover imagem/i }));
    expect(onRemove).toHaveBeenCalledWith('img-1');
  });

  it('should only render the remove button for a primary file when actions are visible', async () => {
    const user = userEvent.setup();
    const file = fileWithPreviewFactory.build({ id: 'img-1', isPrimary: true });

    render(
      <ImageCard
        file={file}
        showActions
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />
    );

    expect(
      screen.queryByRole('button', { name: /definir como capa/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remover imagem/i }));
    expect(onRemove).toHaveBeenCalledWith('img-1');
  });
});
