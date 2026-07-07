import { Loader2, Trash2 } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils';

import { usePermission } from '@/features/permissions';

import type { CatalogItem } from '../../../domain/entities';
import { useRemoveCatalogItemMutation } from '../../hooks/use-mutations';

import { useCurationItem } from './hooks/use-curation-item';
import { formatMoneyInput, parseMoneyInput } from './utils/money';

interface PriceFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
  warning?: boolean;
}

function PriceField({
  label,
  value,
  onChange,
  disabled,
  warning
}: PriceFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          R$
        </span>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={formatMoneyInput(value)}
          disabled={disabled}
          className={cn(
            'h-9 w-[120px] pl-8',
            warning && 'border-amber-500 focus-visible:ring-amber-500/50'
          )}
          onChange={(e) => onChange(parseMoneyInput(e.target.value))}
        />
      </div>
    </div>
  );
}

interface CurationItemProps {
  item: CatalogItem;
  catalogId: string;
}

export function CurationItem({ item, catalogId }: CurationItemProps) {
  const { can } = usePermission();
  const readOnly = !can('catalog:manage');
  const {
    price,
    originalPrice,
    isSaving,
    needsPrice,
    handlePriceChange,
    handleOriginalPriceChange
  } = useCurationItem(item, catalogId);
  const { mutate: removeItem } = useRemoveCatalogItemMutation();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
        needsPrice && 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/10'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-11 w-11 rounded-md">
          {item.product.imageUrl && (
            <AvatarImage
              src={item.product.imageUrl}
              alt={item.product.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="rounded-md text-[10px]">
            IMG
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">
            {item.product.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.product.sku}
          </span>
          {needsPrice && (
            <span className="text-xs text-amber-600 dark:text-amber-500">
              Defina um preço para incluir este item.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PriceField
          label="Preço de venda"
          value={price}
          onChange={handlePriceChange}
          disabled={readOnly}
          warning={needsPrice}
        />
        <PriceField
          label="Preço original"
          value={originalPrice}
          onChange={handleOriginalPriceChange}
          disabled={readOnly}
        />

        {isSaving && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Salvando…"
          />
        )}

        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Remover produto"
            className="hover:text-destructive"
            onClick={() => removeItem(item)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remover produto</span>
          </Button>
        )}
      </div>
    </div>
  );
}
