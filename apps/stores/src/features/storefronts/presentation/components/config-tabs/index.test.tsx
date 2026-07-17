import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tabs } from '@/shared/components/ui/tabs';

import { ConfigTabs } from './index';

describe('ConfigTabs', () => {
  it('should render the three tab triggers', () => {
    render(
      <Tabs value="geral">
        <ConfigTabs />
      </Tabs>
    );

    expect(screen.getByRole('tab', { name: /geral/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /aparência/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /comportamento/i })
    ).toBeInTheDocument();
  });

  it('should mark the active tab as selected', () => {
    render(
      <Tabs value="aparencia">
        <ConfigTabs />
      </Tabs>
    );

    expect(screen.getByRole('tab', { name: /aparência/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /geral/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});
