import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseOrganizationQuery } = vi.hoisted(() => ({
  mockUseOrganizationQuery: vi.fn()
}));

vi.mock('../hooks/use-queries', () => ({
  useOrganizationQuery: mockUseOrganizationQuery
}));

vi.mock('../components/organization-settings-form', () => ({
  OrganizationSettingsForm: () => <div data-testid="settings-form" />
}));

vi.mock('../components/organization-settings-form/skeleton', () => ({
  OrganizationSettingsFormSkeleton: () => (
    <div data-testid="settings-skeleton" />
  )
}));

import { SettingsPage } from './settings';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe o skeleton enquanto a organização carrega', () => {
    mockUseOrganizationQuery.mockReturnValue({ isLoading: true });

    render(<SettingsPage />);

    expect(screen.getByTestId('settings-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-form')).not.toBeInTheDocument();
  });

  it('exibe o formulário quando há dados', () => {
    mockUseOrganizationQuery.mockReturnValue({ isLoading: false });

    render(<SettingsPage />);

    expect(screen.getByTestId('settings-form')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-skeleton')).not.toBeInTheDocument();
  });
});
