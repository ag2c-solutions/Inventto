import { Info } from 'lucide-react';

import { AddItemsDialog } from './components/add-items-dialog';
import { MovementFormFooter } from './components/footer';
import { MovementFormHeader } from './components/header';
import { MovementProductsSection } from './components/products-section';
import {
  MovementFormProvider,
  useMovementForm
} from './hooks/use-movement-form';

function MovementFormContent() {
  const { form, actions } = useMovementForm();

  const items = form.watch('items');
  const showImmutabilityNote = !items || items.length === 0;

  return (
    <form
      onSubmit={form.handleSubmit(actions.submit)}
      className="flex flex-1 min-h-0 flex-col"
    >
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <MovementFormHeader />

        <MovementProductsSection />

        {showImmutabilityNote && (
          <div className="mt-5 flex gap-2.5 rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Movimentações não podem ser editadas nem estornadas. Para
              corrigir, registre uma movimentação inversa.
            </p>
          </div>
        )}
      </div>

      <MovementFormFooter />

      <AddItemsDialog />
    </form>
  );
}

interface MovementFormProps {
  preselectProductId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MovementForm({
  preselectProductId,
  onSuccess,
  onCancel
}: MovementFormProps) {
  return (
    <MovementFormProvider
      preselectProductId={preselectProductId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    >
      <MovementFormContent />
    </MovementFormProvider>
  );
}
