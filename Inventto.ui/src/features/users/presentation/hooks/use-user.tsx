import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type {
  QueryObserverResult,
  RefetchOptions
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth';
import type { Role } from '@/features/permissions';

// eslint-disable-next-line boundaries/dependencies -- TODO: hook de feature não deveria importar infra direto; consumir via hook compartilhado (use-local-storage), ver references/architecture/layers/features.md
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
  setCurrentOrganization: (
    orgId: string,
    availableOverride?: UserOrganization[]
  ) => void;
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

  // Refs sincronizadas a cada render: garantem que `handleSetOrganization`
  // valide contra os dados mais recentes, e não contra o snapshot capturado
  // no closure (que ficava velho após mutações como criar/excluir org).
  const userRef = useRef(user);
  userRef.current = user;

  const currentOrganization = useMemo(() => {
    return UserService.getOrganizationById(user, selectedOrgId);
  }, [user, selectedOrgId]);

  const currentOrganizationRef = useRef(currentOrganization);
  currentOrganizationRef.current = currentOrganization;

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
    (orgId: string, availableOverride?: UserOrganization[]) => {
      // Limpa a seleção (ex.: org atual excluída e sem outra disponível).
      if (!orgId) {
        setSelectedOrgId(null);
        LocalStorageService.removeItem(STORAGE_ORG_KEY);
        return;
      }

      // RN010: ignorar seleção da org já ativa — fecha sem ação
      if (currentOrganizationRef.current?.id === orgId) return;

      // `availableOverride` permite validar contra a lista recém-buscada por
      // uma mutação (criar/excluir), pois `userRef.current` pode ainda não
      // refletir a mudança no instante da chamada.
      const baseUser = userRef.current;
      const source =
        availableOverride && baseUser
          ? { ...baseUser, availableOrganizations: availableOverride }
          : baseUser;

      try {
        const organization = UserService.selectOrganization(source, orgId);

        setIsSwitching(true);
        setSelectedOrgId(organization.id);
        LocalStorageService.setItem(STORAGE_ORG_KEY, organization.id);
      } catch {
        toast.error('Não foi possível trocar de organização. Tente de novo.', {
          duration: 7000
        });
      }
    },
    []
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
