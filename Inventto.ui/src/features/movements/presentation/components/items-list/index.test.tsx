import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  movementFactory,
  movementItemFactory
} from '../../../tests/factories/movement.factory';

import { ItemsList } from '.';

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('ItemsList', () => {
  it('should render the base columns for a non-sale movement', () => {
    const parentData = movementFactory.build({
      type: 'entry',
      reason: 'Compra'
    });
    const items = [movementItemFactory.build({ quantity: 5 })];

    render(<ItemsList data={items} parentData={parentData} />);

    expect(screen.getByText('Produto')).toBeInTheDocument();
    expect(screen.getByText('+ 5')).toBeInTheDocument();
    expect(screen.queryByText('Valor Original')).not.toBeInTheDocument();
  });

  it('should render sale-specific columns when reason includes "venda"', () => {
    const parentData = movementFactory.build({
      type: 'withdrawal',
      reason: 'Venda'
    });
    const items = [
      movementItemFactory.build({
        quantity: 2,
        originalValue: 100,
        discount: 10,
        netValue: 90
      })
    ];

    render(<ItemsList data={items} parentData={parentData} />);

    expect(screen.getByText('Valor Original')).toBeInTheDocument();
    expect(screen.getByText('- 2')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 90,00')).toBeInTheDocument();
  });

  it('should render the product sku and variant options when present', () => {
    const parentData = movementFactory.build({ type: 'entry' });
    const items = [
      movementItemFactory.build({
        product: {
          name: 'Camisa Social',
          sku: 'CS-1',
          variantOptions: 'Cor: Azul'
        }
      })
    ];

    render(<ItemsList data={items} parentData={parentData} />);

    expect(screen.getByText('CS-1')).toBeInTheDocument();
    expect(screen.getByText('Cor: Azul')).toBeInTheDocument();
  });
});
