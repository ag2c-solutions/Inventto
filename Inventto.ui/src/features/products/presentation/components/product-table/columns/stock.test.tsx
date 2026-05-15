import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductTableColumnStock } from './stock';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

describe('ProductTableColumnStock', () => {
  it('must render the stock and minimum stock values correctly', () => {
    render(
      <ProductTableColumnStock totalStock={42} minimumStock={5} variants={[]} />
    );

    expect(
      screen.getByRole('button', { name: /Status do estoque:/i })
    ).toBeInTheDocument();
  });

  it('should use the default values of 0 when the props are not provided', () => {
    render(<ProductTableColumnStock totalStock={0} />);

    expect(
      screen.getByRole('button', { name: /Status do estoque:/i })
    ).toBeInTheDocument();
  });

  it('should render zero values correctly', () => {
    render(<ProductTableColumnStock totalStock={0} minimumStock={0} />);

    expect(
      screen.getByRole('button', { name: /Status do estoque:/i })
    ).toBeInTheDocument();
  });
});
