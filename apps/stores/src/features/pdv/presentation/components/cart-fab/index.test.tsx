import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CartFab } from './index';

describe('CartFab', () => {
  const user = userEvent.setup();

  it('should not render when the cart is empty', () => {
    render(<CartFab count={0} onClick={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: 'Ver venda atual' })
    ).not.toBeInTheDocument();
  });

  it('should render with the item counter when the cart has items', () => {
    render(<CartFab count={3} onClick={vi.fn()} />);

    const fab = screen.getByRole('button', { name: 'Ver venda atual' });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveTextContent('3');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<CartFab count={1} onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Ver venda atual' }));

    expect(onClick).toHaveBeenCalled();
  });
});
