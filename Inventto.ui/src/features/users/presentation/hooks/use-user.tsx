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
import { toast } from 'sonner';

import { useAuth } from '@/features/auth';
import type { Role } from '@/features/permissions';

import { LocalStorageService } from '@/infra/local-storage';

import type { User, UserOrganization } from '../../domain/entities';
import { UserService } from '../../domain/services';

import { useUserProfileQuery } from './use-query';

const STORAGE_ORG_KEY = 'inventto:current-org-id';

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  currentOrganization: UserOrganization | null;
  role: Role | undefined;
  availableOrganizations: UserOrganization[];
  isSwitching: boolean;
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

  // Flag de troca de contexto: ativada quando o selectedOrgId muda mas a
  // currentOrganization ainda não refletiu o novo valor. As queries keyed
  // por organization_id disparam automaticamente os skeletons nas telas.
  const [isSwitching, setIsSwitching] = useState(false);

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

  // Quando currentOrganization se resolve para o novo org, a troca terminou.
  useEffect(() => {
    if (currentOrganization?.id === selectedOrgId) {
      setIsSwitching(false);
    }
  }, [currentOrganization, selectedOrgId]);

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
      // RN010: ignorar seleção da org já ativa — fecha sem ação
      if (currentOrganization?.id === orgId) return;

      try {
        const organization = UserService.selectOrganization(user, orgId);

        setIsSwitching(true);
        setSelectedOrgId(organization.id);
        LocalStorageService.setItem(STORAGE_ORG_KEY, organization.id);
      } catch {
        // Falha ao trocar (org inválida/fora da lista): toast de alerta.
        // TODO SHELL-12: migrar para o helper global de toast quando implementado.
        toast.error('Não foi possível trocar de organização. Tente de novo.');
      }
    },
    [user, currentOrganization]
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
      isSwitching,
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
      isSwitching,
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
