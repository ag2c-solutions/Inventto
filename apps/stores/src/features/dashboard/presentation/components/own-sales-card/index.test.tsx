import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ownRecentSaleFactory } from '../../../tests/factories/recent-activity.factory';

import { OwnSalesCard } from '.';

describe('OwnSalesCard', () => {
  it('should show the code, item count and total for each sale', () => {
    const sale = ownRecentSaleFactory.build({
      code: 'B-204',
      itemsCount: 3,
      total: 318.8
    });

    render(<OwnSalesCard sales={[sale]} />);

    expect(screen.getByText('#B-204')).toBeInTheDocument();
    expect(screen.getByText(/3 itens/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*318,80/)).toBeInTheDocument();
  });

  it('should show neutral microcopy when there are no sales yet', () => {
    render(<OwnSalesCard sales={[]} />);

    expect(screen.getByText('Nenhuma venda ainda.')).toBeInTheDocument();
  });
});
