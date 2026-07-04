import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/features/auth';

// eslint-disable-next-line boundaries/dependencies -- TODO: hook de feature não deveria importar infra direto; consumir via hook compartilhado (use-local-storage), ver references/architecture/layers/features.md
import { LocalStorageService } from '@/infra/local-storage';

import type { User, UserOrganization } from '../../domain/entities';
import { UserService } from '../../domain/services';

import { useUserProfileQuery } from './use-query';
import { useUser } from './use-user';
import { UserProvider } from './use-user';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/infra/local-storage', () => ({
  LocalStorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

vi.mock('../../domain/services', () => ({
  UserService: {
    getOrganizationById: vi.fn(),
    selectOrganization: vi.fn()
  }
}));

vi.mock('./use-query', () => ({
  useUserProfileQuery: vi.fn()
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserProfileQuery = vi.mocked(useUserProfileQuery);
const mockGetItem = vi.mocked(LocalStorageService.getItem);
const mockSetItem = vi.mocked(LocalStorageService.setItem);
const mockRemoveItem = vi.mocked(LocalStorageService.removeItem);
const mockGetOrganizationById = vi.mocked(UserService.getOrganizationById);
const mockSelectOrganization = vi.mocked(UserService.selectOrganization);

const STORAGE_ORG_KEY = 'inventto:current-org-id';

const availableOrganizations: UserOrganization[] = [
  {
    id: 'organization-123',
    name: 'Inventto',
    role: 'owner'
  },
  {
    id: 'organization-456',
    name: 'Smart Tech',
    role: 'manager'
  }
];

const user: User = {
  id: 'user-123',
  email: 'rafael@test.com',
  fullName: 'Rafael Conceição',
  avatarUrl: 'https://cdn.example.com/avatar.png',
  mustChangePassword: false,
  createdAt: new Date('2026-05-04T10:00:00.000Z'),
  updatedAt: new Date('2026-05-04T12:00:00.000Z'),
  availableOrganizations
};

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
  };
}

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetItem.mockReturnValue(null);

    mockUseAuth.mockReturnValue({
      session: {
        user: {
          id: 'user-123'
        }
      }
    } as never);

    mockUseUserProfileQuery.mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as never);

    mockGetOrganizationById.mockReturnValue(availableOrganizations[0]);
    mockSelectOrganization.mockReturnValue(availableOrganizations[1]);
  });

  it('should throw when used outside UserProvider', () => {
    expect(() => renderHook(() => useUser())).toThrow(
      'useUser deve ser usado dentro de um UserProvider'
    );
  });

  it('should expose user context data', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    expect(mockUseUserProfileQuery).toHaveBeenCalledWith('user-123');

    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentOrganization).toEqual(
      availableOrganizations[0]
    );
    expect(result.current.role).toBe('owner');
    expect(result.current.availableOrganizations).toEqual(
      availableOrganizations
    );
  });

  it('should use stored organization id when initializing context', () => {
    mockGetItem.mockReturnValue('organization-456');
    mockGetOrganizationById.mockReturnValue(availableOrganizations[1]);

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_ORG_KEY);
    expect(mockGetOrganizationById).toHaveBeenCalledWith(
      user,
      'organization-456'
    );

    expect(result.current.currentOrganization).toEqual(
      availableOrganizations[1]
    );
    expect(result.current.role).toBe('manager');
  });

  it('should set fallback organization in storage when selected organization is invalid', async () => {
    mockGetItem.mockReturnValue('organization-invalid');
    mockGetOrganizationById.mockReturnValue(availableOrganizations[0]);

    renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_ORG_KEY,
        'organization-123'
      );
    });
  });

  it('should not sync storage when selected organization is already current organization', async () => {
    mockGetItem.mockReturnValue('organization-123');
    mockGetOrganizationById.mockReturnValue(availableOrganizations[0]);

    renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(mockSetItem).not.toHaveBeenCalled();
    });
  });

  it('should select organization through UserService', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setCurrentOrganization('organization-456');
    });

    expect(mockSelectOrganization).toHaveBeenCalledWith(
      user,
      'organization-456'
    );

    expect(mockSetItem).toHaveBeenCalledWith(
      STORAGE_ORG_KEY,
      'organization-456'
    );
  });

  it('should not update storage when selected organization is invalid', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    mockSelectOrganization.mockImplementation(() => {
      throw new Error('Usuário não pertence à organização selecionada.');
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setCurrentOrganization('organization-999');
    });

    expect(mockSelectOrganization).toHaveBeenCalledWith(
      user,
      'organization-999'
    );

    expect(mockSetItem).not.toHaveBeenCalledWith(
      STORAGE_ORG_KEY,
      'organization-999'
    );

    consoleWarnSpy.mockRestore();
  });

  it('should clear the selection and storage when given an empty org id', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setCurrentOrganization('');
    });

    expect(mockSelectOrganization).not.toHaveBeenCalled();
    expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_ORG_KEY);
  });

  it('should validate against the override list when provided', () => {
    const freshOrgs: UserOrganization[] = [
      { id: 'organization-789', name: 'Fresh Org', role: 'owner' }
    ];
    mockSelectOrganization.mockReturnValue(freshOrgs[0]);

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setCurrentOrganization('organization-789', freshOrgs);
    });

    // A validação usa o usuário com a lista fresca, não o snapshot do contexto.
    expect(mockSelectOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ availableOrganizations: freshOrgs }),
      'organization-789'
    );
    expect(mockSetItem).toHaveBeenCalledWith(
      STORAGE_ORG_KEY,
      'organization-789'
    );
  });

  it('should expose unauthenticated state when there is no session user', () => {
    mockUseAuth.mockReturnValue({
      session: null
    } as never);

    mockUseUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as never);

    mockGetOrganizationById.mockReturnValue(null);

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper()
    });

    expect(mockUseUserProfileQuery).toHaveBeenCalledWith(undefined);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.currentOrganization).toBeNull();
    expect(result.current.role).toBeUndefined();
    expect(result.current.availableOrganizations).toEqual([]);
  });
});
