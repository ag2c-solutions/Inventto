import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseUser = vi.fn<() => { currentOrganization: { id: string } | null }>(
  () => ({ currentOrganization: { id: 'org-1' } })
);

vi.mock('../../domain/services', () => ({
  OrganizationService: {
    getById: vi.fn(),
    getMembers: vi.fn(),
    getCandidatesMembers: vi.fn()
  }
}));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { OrganizationService } from '../../domain/services';

import {
  useCandidatesQuery,
  useOrganizationMembersQuery,
  useOrganizationQuery
} from './use-queries';

describe('useOrganizationQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.getById com currentOrganization', async () => {
    vi.mocked(OrganizationService.getById).mockResolvedValue({} as never);
    const { result } = renderHook(() => useOrganizationQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(OrganizationService.getById).toHaveBeenCalledWith({ id: 'org-1' });
  });

  it('deve ter fetchStatus idle e não chamar o service quando currentOrganization é null', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });
    const { result } = renderHook(() => useOrganizationQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(OrganizationService.getById).not.toHaveBeenCalled();
  });

  it('deve expor o estado de erro quando o service lança', async () => {
    vi.mocked(OrganizationService.getById).mockRejectedValue(
      new Error('Falha')
    );
    const { result } = renderHook(() => useOrganizationQuery(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useOrganizationMembersQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.getMembers com currentOrganization', async () => {
    vi.mocked(OrganizationService.getMembers).mockResolvedValue([]);
    const { result } = renderHook(() => useOrganizationMembersQuery(), {
      wrapper
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(OrganizationService.getMembers).toHaveBeenCalledWith({
      id: 'org-1'
    });
  });

  it('deve ter fetchStatus idle e não chamar o service quando currentOrganization é null', () => {
    mockUseUser.mockReturnValue({ currentOrganization: null });
    const { result } = renderHook(() => useOrganizationMembersQuery(), {
      wrapper
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(OrganizationService.getMembers).not.toHaveBeenCalled();
  });

  it('deve expor o estado de erro quando o service lança', async () => {
    vi.mocked(OrganizationService.getMembers).mockRejectedValue(
      new Error('Falha')
    );
    const { result } = renderHook(() => useOrganizationMembersQuery(), {
      wrapper
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCandidatesQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ currentOrganization: { id: 'org-1' } });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve chamar OrganizationService.getCandidatesMembers com currentOrganization', async () => {
    vi.mocked(OrganizationService.getCandidatesMembers).mockResolvedValue([]);
    const { result } = renderHook(() => useCandidatesQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(OrganizationService.getCandidatesMembers).toHaveBeenCalledWith({
      id: 'org-1'
    });
  });

  it('deve expor o estado de erro quando o service lança', async () => {
    vi.mocked(OrganizationService.getCandidatesMembers).mockRejectedValue(
      new Error('Falha')
    );
    const { result } = renderHook(() => useCandidatesQuery(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
