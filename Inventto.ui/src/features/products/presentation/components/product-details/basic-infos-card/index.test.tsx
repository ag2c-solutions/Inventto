import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductBasicInfosCard } from '.';

describe('ProductBasicInfosCard', () => {
  it('should render the information correctly when all the data is provided', () => {
    const props = {
      name: 'Camiseta Básica',
      categories: [{ id: 'cat1', name: 'Vestuário' }],
      sku: 'CAM-BAS-001',
      description: 'Uma camiseta 100% algodão de alta qualidade.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(
      screen.getByRole('heading', { name: props.name, level: 1 })
    ).toBeInTheDocument();

    expect(screen.getByText('Vestuário')).toBeInTheDocument();
    expect(screen.getByText(props.sku)).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it('should display "N/A" when the SKU is not provided or is empty', () => {
    const props = {
      name: 'Produto Sem SKU',
      categories: [{ id: 'cat1', name: 'Geral' }],
      sku: '',
      description: 'Desc.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should display "N/A" when the SKU is not provided or is empty', () => {
    const props = {
      name: 'Produto Undefined',
      categories: [{ id: 'cat1', name: 'Geral' }],
      sku: undefined,
      description: 'Desc.'
    };

    render(<ProductBasicInfosCard {...props} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should render the status badge when isActive is provided', () => {
    render(
      <ProductBasicInfosCard
        name="Produto Ativo"
        categories={[]}
        sku="SKU-1"
        isActive={false}
      />
    );

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
