import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductListTableLoading } from '.';

describe('ProductListTableLoading', () => {
  it('should render the loading skeleton without crashing', () => {
    const { container } = render(<ProductListTableLoading />);

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length
    ).toBeGreaterThan(0);
  });
});
