import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrganizationWithDetails } from '../../../../domain/entities';

const { mockUseOrganizationQuery, mockUseUpdateOrganizationMutation } =
  vi.hoisted(() => ({
    mockUseOrganizationQuery: vi.fn(),
    mockUseUpdateOrganizationMutation: vi.fn()
  }));

vi.mock('../../../hooks/use-queries', () => ({
  useOrganizationQuery: mockUseOrganizationQuery
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useUpdateOrganizationMutation: mockUseUpdateOrganizationMutation
}));

import { useOrganizationSettingsForm } from './index';

const organization: OrganizationWithDetails = {
  id: 'org-1',
  name: 'Ateliê Joana',
  ownerId: 'owner-1',
  createdAt: new Date(),
  settings: {
    identity: { displayName: 'Ateliê Joana', logoUrl: '' },
    operational: {
      timezone: 'America/Sao_Paulo',
      whatsappMain: '11999999999',
      whatsappSupport: ''
    },
    sales: { acceptOrdersOutsideHours: false },
    schedule: {
      mon: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tue: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wed: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thu: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      fri: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      sat: { isOpen: false, openTime: '', closeTime: '' },
      sun: { isOpen: false, openTime: '', closeTime: '' }
    }
  }
};

const makeDirty = (result: {
  current: ReturnType<typeof useOrganizationSettingsForm>;
}) => {
  act(() => {
    result.current.form.setValue('identity.displayName', 'Novo Nome', {
      shouldDirty: true
    });
  });
};

describe('useOrganizationSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrganizationQuery.mockReturnValue({
      data: organization,
      isLoading: false
    });
    mockUseUpdateOrganizationMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    });
  });

  it('não exibe a barra de ações sem alterações pendentes (RN025)', () => {
    const { result } = renderHook(() => useOrganizationSettingsForm());

    expect(result.current.isDirty).toBe(false);
    expect(result.current.showActionBar).toBe(false);
  });

  it('exibe a barra de ações com alterações pendentes fora da Danger Zone', () => {
    const { result } = renderHook(() => useOrganizationSettingsForm());

    makeDirty(result);

    expect(result.current.isDirty).toBe(true);
    expect(result.current.showActionBar).toBe(true);
  });

  it('oculta a barra de ações na aba Danger Zone mesmo com alterações', () => {
    const { result } = renderHook(() => useOrganizationSettingsForm());

    makeDirty(result);
    act(() => {
      result.current.setActiveTab('danger');
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.showActionBar).toBe(false);
  });

  it('Descartar reverte as alterações e oculta a barra de ações', () => {
    const { result } = renderHook(() => useOrganizationSettingsForm());

    makeDirty(result);
    expect(result.current.showActionBar).toBe(true);

    act(() => {
      result.current.onDiscard();
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.showActionBar).toBe(false);
  });

  it('expõe o nome da organização ativa', () => {
    const { result } = renderHook(() => useOrganizationSettingsForm());

    expect(result.current.organizationName).toBe('Ateliê Joana');
  });
});
