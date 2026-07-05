import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseOrganizationSettingsForm } = vi.hoisted(() => ({
  mockUseOrganizationSettingsForm: vi.fn()
}));

vi.mock('./hooks/use-organization-settings-form', () => ({
  useOrganizationSettingsForm: mockUseOrganizationSettingsForm
}));

vi.mock('./tabs/danger', () => ({
  DangerZoneTabContent: () => <div>conteúdo danger</div>
}));
vi.mock('./tabs/operational', () => ({
  OperationalTabContent: () => <div>conteúdo operational</div>
}));
vi.mock('./tabs/schedule', () => ({
  ScheduleTabContent: () => <div>conteúdo schedule</div>
}));
vi.mock('./tabs/store', () => ({
  StoreTabContent: () => <div>conteúdo store</div>
}));

import { OrganizationSettingsForm } from '.';

function useFormMock() {
  return useForm({ defaultValues: { name: '' } });
}

describe('OrganizationSettingsForm', () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((e) => e?.preventDefault?.());
  const onDiscard = vi.fn();
  const setActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function baseHookReturn(overrides = {}) {
    return {
      form: undefined as never,
      onSubmit,
      onDiscard,
      isLoading: false,
      showActionBar: false,
      organizationName: 'Ateliê Joana',
      activeTab: 'general',
      setActiveTab,
      logoPreview: undefined,
      handleLogoChange: vi.fn(),
      handleCepBlur: vi.fn(),
      cepLoading: false,
      ...overrides
    };
  }

  function renderWithForm(overrides = {}) {
    mockUseOrganizationSettingsForm.mockImplementation(() => ({
      ...baseHookReturn(overrides),
      form: useFormMock()
    }));

    return render(<OrganizationSettingsForm />);
  }

  it('exibe o nome da organização ativa e a aba Loja por padrão', () => {
    renderWithForm();

    expect(
      screen.getByText('Ateliê Joana · organização ativa')
    ).toBeInTheDocument();
    expect(screen.getByText('conteúdo store')).toBeInTheDocument();
  });

  it('não exibe a barra de ações quando showActionBar é false', () => {
    renderWithForm({ showActionBar: false });

    expect(
      screen.queryByRole('button', { name: 'Salvar alterações' })
    ).not.toBeInTheDocument();
  });

  it('exibe a barra de ações e chama onDiscard/onSubmit quando showActionBar é true', async () => {
    renderWithForm({ showActionBar: true });

    await user.click(screen.getAllByText('Descartar')[0]);
    expect(onDiscard).toHaveBeenCalled();

    await user.click(screen.getAllByText('Salvar alterações')[0]);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('desabilita os botões da barra de ações durante o carregamento', () => {
    renderWithForm({ showActionBar: true, isLoading: true });

    const discardButtons = screen.getAllByRole('button', { name: 'Descartar' });
    discardButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it('troca de aba ao clicar em outro trigger', async () => {
    renderWithForm();

    await user.click(screen.getByRole('tab', { name: 'Horários' }));

    expect(setActiveTab).toHaveBeenCalledWith('schedule');
  });
});
