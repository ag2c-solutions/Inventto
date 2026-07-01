import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductInventoryCard } from '.';

vi.mock('@/features/permissions', () => ({
  VisibleTo: ({ children }: { children: React.ReactNode; action: string }) => {
    // Para fins de teste, se a action for stock:view_costs e tivermos habilitado via mock interno, renderiza
    // Ou podemos renderizar sempre ou nunca baseado em algum spy.
    // Como simplificação, vamos assumir que ele renderiza os filhos no teste que precisa ver custos,
    // e criamos um componente mock que lê uma variável global ou mockReturnValue do usePermission.
    // Melhor mockar a nível de export:
    return <>{children}</>;
  }
}));

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

  it('should show the weighted average cost rows when costPrice is provided', () => {
    render(<ProductInventoryCard stock={10} costPrice={22.9} />);

    expect(screen.getByText('Custo médio ponderado')).toBeInTheDocument();
    expect(screen.getByText('R$ 22,90')).toBeInTheDocument();
    expect(screen.getByText('Custo total do estoque')).toBeInTheDocument();
    expect(screen.getByText('R$ 229,00')).toBeInTheDocument();
  });

  it('should render the cost rows with empty values when costPrice is undefined but permission is granted', () => {
    render(<ProductInventoryCard stock={10} />);

    expect(screen.getByText('Custo médio ponderado')).toBeInTheDocument();
  });
});
