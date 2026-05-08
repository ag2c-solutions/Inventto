import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { MovementApi } from '../../data/api';

export function useMovementsQuery(filters?: { productId?: string }) {
  const { currentOrganization: organization } = useUser();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['movements', organizationId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Nenhuma organização selecionada.');

      return MovementApi.getAll({
        organizationId,
        productId: filters?.productId
      });
    },
    enabled: !!organizationId
  });
}
