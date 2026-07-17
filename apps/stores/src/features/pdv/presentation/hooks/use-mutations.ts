import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import type {
  PaymentMethod,
  SaleCustomerInput,
  SaleItemInput
} from '../../domain/entities';
import { PdvSaleService } from '../../domain/services';
import { useCartStore } from '../stores/cart-store';

export interface ConfirmSaleMutationInput {
  catalogId: string;
  customer: SaleCustomerInput | null;
  items: SaleItemInput[];
  paymentMethod: PaymentMethod;
  // Em centavos — só relevante para paymentMethod === 'cash'.
  amountPaid?: number;
  proofFile?: File;
}

export function useConfirmPosSaleMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: ({
      catalogId,
      customer,
      items,
      paymentMethod,
      amountPaid,
      proofFile
    }: ConfirmSaleMutationInput) => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não encontrada.');
      }

      return PdvSaleService.confirm(
        {
          organizationId: currentOrganization.id,
          catalogId,
          customer: customer ?? undefined,
          items,
          paymentMethod,
          amountPaid
        },
        proofFile
      );
    },
    meta: { successMessage: 'Venda registrada.' },
    onSuccess: () => {
      // Sucesso: carrinho limpo, FAB some (RN064/RN066). Erro preserva o
      // carrinho — nada aqui roda se a mutation rejeitar.
      useCartStore.getState().clear();

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      // Prefixo — invalida usePdvProductsQuery para qualquer catalogId
      // (o saldo mudou após a baixa de estoque).
      queryClient.invalidateQueries({ queryKey: ['pdv', 'products'] });
    }
  });
}
