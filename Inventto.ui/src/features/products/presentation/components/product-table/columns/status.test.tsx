import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductTableColumnStatus } from './status';

describe('ProductTableColumnStatus', () => {
  it('should render "Ativo" when isActive is true', () => {
    render(<ProductTableColumnStatus isActive />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should render "Inativo" when isActive is false', () => {
    render(<ProductTableColumnStatus isActive={false} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
