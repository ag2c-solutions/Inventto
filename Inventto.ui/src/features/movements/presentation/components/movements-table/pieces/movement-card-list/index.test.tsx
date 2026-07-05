import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Movement } from '../../../../../domain/entities';
import { movementFactory } from '../../../../../tests/factories/movement.factory';

import { MovementCardList } from '.';

vi.mock('./pieces/movement-card', () => ({
  MovementCard: ({ movement }: { movement: Movement }) => (
    <div data-testid="mock-movement-card">{movement.id}</div>
  )
}));

function renderList(props: {
  movements: Movement[];
  productId?: string;
  productName?: string;
}) {
  return render(
    <MemoryRouter>
      <MovementCardList {...props} />
    </MemoryRouter>
  );
}

describe('MovementCardList', () => {
  const user = userEvent.setup();

  it('should render one card per movement', () => {
    const movements = movementFactory.buildList(3);

    renderList({ movements });

    expect(screen.getAllByTestId('mock-movement-card')).toHaveLength(3);
  });

  it('should show the product filter chip when productId is provided', () => {
    const movements = movementFactory.buildList(1);

    renderList({
      movements,
      productId: 'prod-1',
      productName: 'Camisa Social'
    });

    expect(screen.getByText('Filtrando por produto:')).toBeInTheDocument();
    expect(screen.getByText('Camisa Social')).toBeInTheDocument();
  });

  it('should filter by type when a tab is selected', async () => {
    const entry = movementFactory.build({ type: 'entry', id: 'mov-entry' });
    const withdrawal = movementFactory.build({
      type: 'withdrawal',
      id: 'mov-withdrawal'
    });

    renderList({ movements: [entry, withdrawal] });

    expect(screen.getAllByTestId('mock-movement-card')).toHaveLength(2);

    await user.click(screen.getByRole('tab', { name: /Entradas/ }));

    const cards = screen.getAllByTestId('mock-movement-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('mov-entry');
  });

  it('should show a search-specific empty message when the search has no matches', async () => {
    const movements = movementFactory.buildList(1, {
      items: [
        {
          id: 'item-1',
          movementId: 'mov-1',
          productId: 'prod-1',
          quantity: 1,
          unitCost: 0,
          unitPrice: 0,
          product: { name: 'Camisa Social' }
        }
      ]
    });

    renderList({ movements });

    await user.type(
      screen.getByPlaceholderText('Buscar por produto ou SKU'),
      'produto-inexistente'
    );

    expect(
      screen.getByText("Nada encontrado para 'produto-inexistente'.")
    ).toBeInTheDocument();
  });

  it('should show a generic empty message when there are no movements at all', () => {
    renderList({ movements: [] });

    expect(
      screen.getByText(
        'Nada encontrado. Tente ajustar os filtros de tipo e período.'
      )
    ).toBeInTheDocument();
  });
});
