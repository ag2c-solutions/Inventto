import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  useEffect
} from 'react';
import { useAuth } from '@/app/features/auth/hooks/use-auth';
import { useUserProfileQuery } from './use-query';
import { LocalStorageService } from '@/app/services/local-storage';
import type { User, UserOrganizationContext, UserRole } from '../types';

const STORAGE_ORG_KEY = 'inventto:current-org-id';

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  organization: UserOrganizationContext | null;
  role: UserRole | undefined;
  availableOrganizations: UserOrganizationContext[];

  refetch: () => void;
  setCurrentOrganization: (orgId: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

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
    if (!user?.availableOrganizations?.length) return null;

    const found = user.availableOrganizations.find(
      (org) => org.id === selectedOrgId
    );

    return found || user.availableOrganizations[0];
  }, [user, selectedOrgId]);

  useEffect(() => {
    if (currentOrganization && currentOrganization.id !== selectedOrgId) {
      setSelectedOrgId(currentOrganization.id);

      LocalStorageService.setItem(STORAGE_ORG_KEY, currentOrganization.id);
    }
  }, [currentOrganization, selectedOrgId]);

  const handleSetOrganization = useCallback(
    (orgId: string) => {
      if (!user) return;

      const isValid = user.availableOrganizations.some(
        (org) => org.id === orgId
      );

      if (!isValid) {
        console.warn(
          `Tentativa de acesso não autorizado à organização: ${orgId}`
        );
        return;
      }

      LocalStorageService.setItem(STORAGE_ORG_KEY, orgId);
      setSelectedOrgId(orgId);
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

      isAuthenticated: !!user,
      organization: currentOrganization,
      role: currentOrganization?.role,
      availableOrganizations: user?.availableOrganizations ?? [],

      setCurrentOrganization: handleSetOrganization
    }),
    [
      user,
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
  if (!context)
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  return context;
}
