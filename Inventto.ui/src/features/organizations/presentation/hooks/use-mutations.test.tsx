import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseUser = vi.fn(() => ({
  user: { id: 'user-1' },
  currentOrganization: { id: 'org-1' }
}));

vi.mock('../../domain/services', () => ({
  OrganizationService: {
    create: vi.fn(),
    update: vi.fn(),
    createMember: vi.fn(),
    replicateMember: vi.fn(),
    updateMemberRole: vi.fn(),
    updateMemberStatus: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser(),
  USERS_KEYS: {
    profile: (userId: string | undefined) => ['users', 'profile', userId]
  }
}));

import { OrganizationService } from '../../domain/services';

import {
  useCreateMemberMutation,
  useCreateOrganizationMutation,
  useReplicateMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
  useUpdateOrganizationMutation
} from './use-mutations';

describe('useCreateOrganizationMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.create com o payload correto', async () => {
    vi.mocked(OrganizationService.create).mockResolvedValue('new-org-id');
    const { result } = renderHook(() => useCreateOrganizationMutation(), {
      wrapper
    });
    const payload = { name: 'Nova Empresa', slug: 'nova-empresa' };
    await result.current.mutateAsync(payload);
    expect(OrganizationService.create).toHaveBeenCalledWith(payload);
  });

  it('deve invalidar USERS_KEYS.profile(user.id) no onSuccess', async () => {
    vi.mocked(OrganizationService.create).mockResolvedValue('new-org-id');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateOrganizationMutation(), {
      wrapper
    });
    await result.current.mutateAsync({
      name: 'Nova Empresa',
      slug: 'nova-empresa'
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['users', 'profile', 'user-1']
    });
  });
});

describe('useUpdateOrganizationMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.update com currentOrganization e settings', async () => {
    vi.mocked(OrganizationService.update).mockResolvedValue(undefined);
    const { result } = renderHook(() => useUpdateOrganizationMutation(), {
      wrapper
    });
    const settings = {} as never;
    await result.current.mutateAsync(settings);
    expect(OrganizationService.update).toHaveBeenCalledWith(
      { id: 'org-1' },
      settings
    );
  });

  it('deve invalidar ORG_KEYS.detail no onSuccess', async () => {
    vi.mocked(OrganizationService.update).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateOrganizationMutation(), {
      wrapper
    });
    await result.current.mutateAsync({} as never);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations', 'detail', 'org-1']
    });
  });
});

describe('useCreateMemberMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.createMember com currentOrganization e data', async () => {
    vi.mocked(OrganizationService.createMember).mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreateMemberMutation(), { wrapper });
    const data = {
      name: 'João',
      email: 'joao@email.com',
      role: 'sales' as const,
      password: '123456'
    };
    await result.current.mutateAsync(data);
    expect(OrganizationService.createMember).toHaveBeenCalledWith(
      { id: 'org-1' },
      data
    );
  });

  it('deve invalidar ORG_KEYS.members e ORG_KEYS.candidates no onSuccess', async () => {
    vi.mocked(OrganizationService.createMember).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateMemberMutation(), { wrapper });
    await result.current.mutateAsync({
      name: 'João',
      email: 'joao@email.com',
      role: 'sales',
      password: '123456'
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations', 'members', 'org-1']
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations', 'candidates', 'org-1']
    });
  });
});

describe('useReplicateMemberMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.replicateMember com currentOrganization, userId e role', async () => {
    vi.mocked(OrganizationService.replicateMember).mockResolvedValue(undefined);
    const { result } = renderHook(() => useReplicateMemberMutation(), {
      wrapper
    });
    await result.current.mutateAsync({ userId: 'user-2', role: 'manager' });
    expect(OrganizationService.replicateMember).toHaveBeenCalledWith(
      { id: 'org-1' },
      'user-2',
      'manager'
    );
  });

  it('deve invalidar ORG_KEYS.members e ORG_KEYS.candidates no onSuccess', async () => {
    vi.mocked(OrganizationService.replicateMember).mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useReplicateMemberMutation(), {
      wrapper
    });
    await result.current.mutateAsync({ userId: 'user-2', role: 'sales' });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations', 'members', 'org-1']
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations', 'candidates', 'org-1']
    });
  });
});

describe('useUpdateMemberRoleMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.updateMemberRole com memberId e role', async () => {
    vi.mocked(OrganizationService.updateMemberRole).mockResolvedValue(
      undefined
    );
    const { result } = renderHook(() => useUpdateMemberRoleMutation(), {
      wrapper
    });
    await result.current.mutateAsync({ memberId: 'member-1', role: 'manager' });
    expect(OrganizationService.updateMemberRole).toHaveBeenCalledWith(
      'member-1',
      'manager'
    );
  });

  it('deve invalidar ORG_KEYS.all no onSuccess', async () => {
    vi.mocked(OrganizationService.updateMemberRole).mockResolvedValue(
      undefined
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateMemberRoleMutation(), {
      wrapper
    });
    await result.current.mutateAsync({ memberId: 'member-1', role: 'sales' });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations']
    });
  });
});

describe('useUpdateMemberStatusMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      currentOrganization: { id: 'org-1' }
    });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.updateMemberStatus com memberId e status', async () => {
    vi.mocked(OrganizationService.updateMemberStatus).mockResolvedValue(
      undefined
    );
    const { result } = renderHook(() => useUpdateMemberStatusMutation(), {
      wrapper
    });
    await result.current.mutateAsync({
      memberId: 'member-1',
      status: 'inactive'
    });
    expect(OrganizationService.updateMemberStatus).toHaveBeenCalledWith(
      'member-1',
      'inactive'
    );
  });

  it('deve invalidar ORG_KEYS.all no onSuccess', async () => {
    vi.mocked(OrganizationService.updateMemberStatus).mockResolvedValue(
      undefined
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateMemberStatusMutation(), {
      wrapper
    });
    await result.current.mutateAsync({
      memberId: 'member-1',
      status: 'active'
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['organizations']
    });
  });
});
