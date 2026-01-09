import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MovementService } from '../service';
import { useUser } from '@/app/features/users/hooks/use-user'; 
import type { CreateMovementInput } from '../types/model';

export function useMovementsQuery(filters?: { productId?: string }) {
  const { organization } = useUser();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['movements', organizationId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');
      
      return MovementService.getAll({ 
        organizationId,
        productId: filters?.productId 
      });
    },
    enabled: !!organizationId,
  });
}

export function useCreateMovementMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const organizationId = organization?.id;

  return useMutation({
    mutationFn: (input: CreateMovementInput) => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');
      
      return MovementService.create(input, organizationId);
    },
    meta: {
      successMessage: 'Movimentação registrada com sucesso!',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}