import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type {
  QueryObserverResult,
  RefetchOptions
} from '@tanstack/react-query';

import { useAuth } from '@/features/auth';

import { LocalStorageService } from '@/infra/local-storage';

import type {
  User,
  UserOrganizationContext,
  UserRole
} from '../../domain/entities';
import { UserService } from '../../domain/services';

import { useUserProfileQuery } from './use-query';

const STORAGE_ORG_KEY = 'inventto:current-org-id';

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  currentOrganization: UserOrganizationContext | null;
  role: UserRole | undefined;
  availableOrganizations: UserOrganizationContext[];
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<User | null, Error>>;
  setCurrentOrganization: (orgId: string) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    () => LocalStorageService.getItem<string>(STORAGE_ORG_KEY) ?? null
  );

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch
  } = useUserProfileQuery(userId);

  const currentOrganization = useMemo(() => {
    return UserService.getOrganizationById(user, selectedOrgId);
  }, [user, selectedOrgId]);

  useEffect(() => {
    if (!user?.availableOrganizations.length) return;

    const organization = UserService.getOrganizationById(user, selectedOrgId);

    if (!organization) return;

    if (organization.id === selectedOrgId) return;

    setSelectedOrgId(organization.id);
    LocalStorageService.setItem(STORAGE_ORG_KEY, organization.id);
  }, [user, selectedOrgId]);

  const handleSetOrganization = useCallback(
    (orgId: string) => {
      try {
        const organization = UserService.selectOrganization(user, orgId);

        setSelectedOrgId(organization.id);
        LocalStorageService.setItem(STORAGE_ORG_KEY, organization.id);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(error);
        }
      }
    },
    [user]
  );

  const value = useMemo<UserContextType>(
    () => ({
      user,
      isLoading,
      isError,
      error,
      refetch,
      isAuthenticated: !!userId,
      currentOrganization,
      role: currentOrganization?.role,
      availableOrganizations: user?.availableOrganizations ?? [],
      setCurrentOrganization: handleSetOrganization
    }),
    [
      user,
      userId,
      isLoading,
      isError,
      error,
      refetch,
      currentOrganization,
      handleSetOrganization
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
}
