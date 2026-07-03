import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { Movement } from '@/features/movements/domain/entities';

import { ItemsList } from '../items-list';

interface Props {
  movement: Movement;
}

export const MovementDetails = ({ movement }: Props) => {
  const date = movement.executedAt || movement.createdAt;

  return (
    <div className="p-4 bg-muted/30">
      <div className="overflow-hidden">
        <div className="flex items-center justify-between pb-2 px-1">
          <div className="flex items-center gap-3">
            <h4 className="font-bold uppercase tracking-wide text-xs text-muted-foreground">
              Detalhes da movimentação
            </h4>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(date, "dd/MM/yyyy '·' HH:mm", {
              locale: ptBR
            })}
          </div>
        </div>
        {movement.reason === 'Outro' && movement.description && (
          <div className="px-4 py-3 italic text-sm text-muted-foreground">
            &ldquo;{movement.description}&rdquo;
          </div>
        )}
        <ItemsList data={movement.items} parentData={movement} />
      </div>
    </div>
  );
};
