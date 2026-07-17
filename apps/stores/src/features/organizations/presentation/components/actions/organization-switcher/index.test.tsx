import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from '@/shared/components/ui/sidebar';

const { mockUseOrganizationSwitcher } = vi.hoisted(() => ({
  mockUseOrganizationSwitcher: vi.fn()
}));

vi.mock('./hooks/use-organization-switcher', () => ({
  useOrganizationSwitcher: mockUseOrganizationSwitcher
}));

vi.mock('../create-organization', () => ({
  CreateOrganizationDialog: () => <button>Criar organização</button>
}));

import { OrganizationSwitcher } from '.';

const baseOrganizations = [
  { id: 'org-1', name: 'Ateliê Joana', role: 'owner' },
  { id: 'org-2', name: 'Filial Sul', role: 'manager' }
];

function renderSwitcher() {
  return render(
    <SidebarProvider>
      <OrganizationSwitcher />
    </SidebarProvider>
  );
}

describe('OrganizationSwitcher', () => {
  const user = userEvent.setup();
  const handleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrganizationSwitcher.mockReturnValue({
      open: false,
      setOpen: vi.fn(),
      currentOrganization: baseOrganizations[0],
      availableOrganizations: baseOrganizations,
      isStaticTrigger: false,
      handleSelect
    });
  });

  it('exibe o skeleton quando ainda não há organização atual', () => {
    mockUseOrganizationSwitcher.mockReturnValue({
      open: false,
      setOpen: vi.fn(),
      currentOrganization: null,
      availableOrganizations: [],
      isStaticTrigger: false,
      handleSelect
    });

    const { container } = renderSwitcher();

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });

  it('exibe o trigger estático quando isStaticTrigger é true', () => {
    mockUseOrganizationSwitcher.mockReturnValue({
      open: false,
      setOpen: vi.fn(),
      currentOrganization: baseOrganizations[0],
      availableOrganizations: baseOrganizations,
      isStaticTrigger: true,
      handleSelect
    });

    renderSwitcher();

    expect(screen.getByText('Ateliê Joana')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('exibe o nome e o papel da organização atual no trigger', () => {
    renderSwitcher();

    expect(screen.getByText('Ateliê Joana')).toBeInTheDocument();
  });

  it('lista as organizações disponíveis e chama handleSelect ao selecionar uma', async () => {
    mockUseOrganizationSwitcher.mockReturnValue({
      open: true,
      setOpen: vi.fn(),
      currentOrganization: baseOrganizations[0],
      availableOrganizations: baseOrganizations,
      isStaticTrigger: false,
      handleSelect
    });

    renderSwitcher();

    await user.click(screen.getByText('Filial Sul'));

    expect(handleSelect).toHaveBeenCalledWith('org-2');
  });

  it('compõe o gatilho de criar organização dentro da lista', () => {
    mockUseOrganizationSwitcher.mockReturnValue({
      open: true,
      setOpen: vi.fn(),
      currentOrganization: baseOrganizations[0],
      availableOrganizations: baseOrganizations,
      isStaticTrigger: false,
      handleSelect
    });

    renderSwitcher();

    expect(screen.getByText('Criar organização')).toBeInTheDocument();
  });
});
