import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInventoryCard } from '.';

describe('ProductInventoryCard', () => {
  it('must render the stock and minimum stock values correctly', () => {
    const props = {
      minimumStock: 5,
      stock: 42
    };

    render(<ProductInventoryCard {...props} />);

    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.getByText('Estoque mínimo')).toBeInTheDocument();
    expect(screen.getByText('5 un.')).toBeInTheDocument();
    expect(screen.getByText('Estoque atual')).toBeInTheDocument();
    expect(screen.getByText('42 un.')).toBeInTheDocument();
  });

  it('should use the default values of 0 when the props are not provided', () => {
    render(<ProductInventoryCard />);

    const zeros = screen.getAllByText('0 un.');

    expect(zeros).toHaveLength(2);
  });

  it('should render zero values correctly', () => {
    render(<ProductInventoryCard minimumStock={0} stock={0} />);

    const zeros = screen.getAllByText('0 un.');

    expect(zeros).toHaveLength(2);
  });
});
