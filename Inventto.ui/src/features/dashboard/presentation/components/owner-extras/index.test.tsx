import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OwnerExtras } from '.';

describe('OwnerExtras', () => {
  it('should render inventory and average margin for the owner', () => {
    render(
      <OwnerExtras role="owner" inventoryAtCost={18822.93} avgMargin={0.9463} />
    );

    expect(screen.getByText('Inventário a custo')).toBeInTheDocument();
    expect(screen.getByText('Margem média')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*18\.822,93/)).toBeInTheDocument();
    expect(screen.getByText(/94,6%/)).toBeInTheDocument();
    expect(screen.getAllByText(/exclusivo do Dono/)).toHaveLength(2);
  });

  it('should render nothing for the manager', () => {
    const { container } = render(
      <OwnerExtras role="manager" inventoryAtCost={100} avgMargin={0.5} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing for sales', () => {
    const { container } = render(<OwnerExtras role="sales" />);

    expect(container).toBeEmptyDOMElement();
  });
});
