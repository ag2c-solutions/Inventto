import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StateBadge } from './index';

describe('StateBadge', () => {
  it('should render "No ar" when state is live', () => {
    render(<StateBadge state="live" />);

    expect(screen.getByText('No ar')).toBeInTheDocument();
  });

  it('should render "Inativa" when state is inactive', () => {
    render(<StateBadge state="inactive" />);

    expect(screen.getByText('Inativa')).toBeInTheDocument();
  });
});
