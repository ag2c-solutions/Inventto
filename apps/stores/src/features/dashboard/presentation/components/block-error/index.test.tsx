import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BlockError } from '.';

describe('BlockError', () => {
  it('should show the error microcopy', () => {
    render(<BlockError onRetry={vi.fn()} />);

    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument();
  });

  it('should call onRetry when the retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<BlockError onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /tentar de novo/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
