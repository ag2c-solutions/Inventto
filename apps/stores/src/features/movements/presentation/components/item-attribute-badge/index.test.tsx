import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ItemAttributeBadge } from '.';

describe('ItemAttributeBadge', () => {
  it('should render a ColorBadge when the value looks like a hex color', () => {
    render(<ItemAttributeBadge option={{ name: 'Cor', value: '#FF0000' }} />);

    expect(screen.getByText('#FF0000')).toBeInTheDocument();
  });

  it('should render a plain Badge when the value is not a color', () => {
    render(<ItemAttributeBadge option={{ name: 'Tamanho', value: 'M' }} />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });
});
