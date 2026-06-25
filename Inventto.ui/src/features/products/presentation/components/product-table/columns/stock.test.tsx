import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { IProductVariant } from '../../../../domain/entities';

import { ProductTableColumnStock } from './stock';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

const makeVariant = (
  overrides: Partial<IProductVariant> & { stock: number; minimumStock: number }
): IProductVariant => ({
  id: `v-${overrides.sku ?? overrides.stock}`,
  sku: 'SKU',
  isActive: true,
  images: [],
  options: [{ name: 'Cor', value: 'Branco' }],
  ...overrides
});

describe('ProductTableColumnStock', () => {
  it('produto simples: expõe o status do estoque saudável no ícone', () => {
    render(
      <ProductTableColumnStock totalStock={42} minimumStock={5} variants={[]} />
    );

    expect(
      screen.getByRole('button', { name: 'Status do estoque: Saudável' })
    ).toBeInTheDocument();
  });

  it('produto simples: saldo 0 deriva o estado Zerado (RN050)', () => {
    render(<ProductTableColumnStock totalStock={0} minimumStock={5} />);

    expect(
      screen.getByRole('button', { name: 'Status do estoque: Zerado' })
    ).toBeInTheDocument();
  });

  it('grade: ícone reflete o pior caso e o popover mostra o resumo e o total físico das ativas', async () => {
    const user = userEvent.setup();

    render(
      <ProductTableColumnStock
        totalStock={0}
        variants={[
          makeVariant({ stock: 30, minimumStock: 5 }), // healthy
          makeVariant({ stock: 0, minimumStock: 6 }) // zeroed → pior caso
        ]}
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Status do estoque: Zerado'
    });

    await user.click(trigger);

    expect(screen.getByText('Resumo da grade')).toBeInTheDocument();
    expect(screen.getByText('Total físico: 30 un.')).toBeInTheDocument();
  });
});
