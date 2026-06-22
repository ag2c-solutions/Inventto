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
  const { user, setCurrentOrganization } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrganizationInput) =>
      OrganizationService.create(payload),
    onSuccess: async (newOrgId: string) => {
      // Invalida o perfil do usuário para refletir a nova org na lista
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: USERS_KEYS.profile(user.id)
        });
      }

      // Invalida queries de organizações
      await queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });

      // Troca o contexto para a nova organização e navega para configurações
      setCurrentOrganization(newOrgId);
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
      // O acesso de Manager/Sales àquela org deixa de existir; o perfil do
      // usuário e as queries de organização precisam refletir o novo estado.
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
      successMessage: 'Convite enviado com sucesso!'
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
      successMessage: 'Membro importado com sucesso!'
    }
  });
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      OrganizationService.updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });
    },
    meta: {
      successMessage: 'Cargo do membro atualizado.'
    }
  });
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status
    }: {
      memberId: string;
      status: MemberStatus;
    }) => OrganizationService.updateMemberStatus(memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });
    },
    meta: {
      successMessage: 'Status do membro alterado.'
    }
  });
}
