import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NotificationEmpty } from '.';

describe('NotificationEmpty', () => {
  it('should render the empty state message', () => {
    render(<NotificationEmpty />);

    expect(screen.getByText('Sem novidades.')).toBeInTheDocument();
  });
});
