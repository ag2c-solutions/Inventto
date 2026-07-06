import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./field-images', () => ({
  ProductFormFieldImages: () => <div data-testid="field-images" />
}));

import { ProductImages } from '.';

describe('ProductImages', () => {
  it('should render the step title and the images field', () => {
    render(<ProductImages />);

    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByTestId('field-images')).toBeInTheDocument();
  });
});
