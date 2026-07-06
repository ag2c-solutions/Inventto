import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MovementsListTableLoading } from '.';

describe('MovementsListTableLoading', () => {
  it('should render without crashing', () => {
    const { container } = render(<MovementsListTableLoading />);

    expect(container.firstChild).not.toBeNull();
  });
});
