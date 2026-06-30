import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Role } from '@/features/permissions';
import { USERS_KEYS, useUser } from '@/features/users';

import type {
  CreateMember,
  CreateOrganizationInput,
  MemberStatus,
  UpdateOrganizationInput
} from '../../domain/entities';
import { OrganizationService } from '../../domain/services';
import { ORG_KEYS } from '../constants/org-keys';

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { setCurrentOrganization, refetch } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrganizationInput) =>
      OrganizationService.create(payload),
    onSuccess: async (newOrgId: string) => {
      await queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });

      // Rebusca o perfil para obter a lista já contendo a nova organização e
      // troca o contexto para ela validando contra esses dados frescos — sem
      // depender do snapshot velho do `user` no closure.
      const { data: freshUser } = await refetch();

      setCurrentOrganization(newOrgId, freshUser?.availableOrganizations);
      navigate('/settings');
    },
    meta: {
      successMessage: 'Organização criada.'
    }
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      OrganizationService.update(currentOrganization, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.detail(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Alterações salvas.',
      errorMessage: 'Não foi possível salvar. Tente de novo.'
    }
  });
}

export function useDeactivateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { user, currentOrganization } = useUser();

  return useMutation({
    mutationFn: () => OrganizationService.deactivate(currentOrganization),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ORG_KEYS.detail(currentOrganization?.id ?? '')
      });

      await queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });

      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: USERS_KEYS.profile(user.id)
        });
      }
    },
    meta: {
      successMessage: 'Organização desativada.'
    }
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();
  const {
    currentOrganization,
    availableOrganizations,
    setCurrentOrganization,
    refetch
  } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (purge: boolean) =>
      OrganizationService.remove(currentOrganization, purge),
    onSuccess: async () => {
      const deletedOrgId = currentOrganization?.id;

      // 1) Troca para uma org remanescente e sai da tela da org excluída ANTES
      //    de mexer no cache. A org alvo já existe na lista atual (a exclusão
      //    só removeu `deletedOrgId`), então a troca é segura sem refetch. Isso
      //    faz a query de detalhe (useOrganizationQuery) parar de observar a
      //    org excluída — sem isso, o invalidate abaixo refazia o `getById` de
      //    um registro inexistente (406 / PGRST116).
      const nextOrg = availableOrganizations.find(
        (org) => org.id !== deletedOrgId
      );

      setCurrentOrganization(nextOrg?.id ?? '');
      navigate('/');

      // 2) Após o React reapontar/desmontar a tela de detalhe (o await dá esse
      //    tempo), rebusca o perfil já sem a org excluída, descarta o cache
      //    dela e revalida o restante das listas.
      await refetch();

      queryClient.removeQueries({
        queryKey: ORG_KEYS.detail(deletedOrgId ?? '')
      });
      await queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });
    },
    meta: {
      successMessage: 'Organização excluída.'
    }
  });
}

export function useCreateMemberMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: (data: CreateMember) =>
      OrganizationService.createMember(currentOrganization, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });

      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.candidates(currentOrganization?.id ?? '')
      });
    },

    meta: {
      // O erro de "e-mail de outro negócio" (RN034) é tratado inline no form
      // via discriminador EMAIL_OTHER_TENANT_ERROR — sem toast genérico.
      successMessage: 'Membro adicionado à organização.',
      suppressErrorToast: true
    }
  });
}

export function useReplicateMemberMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: ({
      userId,
      role
    }: {
      userId: string;
      role: 'manager' | 'sales';
    }) =>
      OrganizationService.replicateMember(currentOrganization, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.candidates(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Membro adicionado à organização.'
    }
  });
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      OrganizationService.updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Alterações salvas.',
      errorMessage: 'Não foi possível salvar. Tente de novo.'
    }
  });
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: ({
      memberId,
      status
    }: {
      memberId: string;
      status: MemberStatus;
    }) => OrganizationService.updateMemberStatus(memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Alterações salvas.',
      errorMessage: 'Não foi possível salvar. Tente de novo.'
    }
  });
}
