import { Tag } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { MoneyInput } from '@/shared/components/ui/money-input';
import { Switch } from '@/shared/components/ui/switch';
import { cn, formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { DiscountMode } from '../../../domain/validators';

interface DiscountFieldsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  mode: DiscountMode;
  onModeChange: (mode: DiscountMode) => void;
  value: number;
  onValueChange: (value: number) => void;
  referencePrice: number;
  discountAmount: number;
  unitFinalPrice: number;
  invalid: boolean;
  errorMessage?: string;
}

export function DiscountFields({
  enabled,
  onToggle,
  mode,
  onModeChange,
  value,
  onValueChange,
  referencePrice,
  discountAmount,
  unitFinalPrice,
  invalid,
  errorMessage
}: DiscountFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Tag className="h-4 w-4 shrink-0" />
          <span>
            Aplicar desconto{' '}
            <span className="font-normal text-muted-foreground">
              · opcional
            </span>
          </span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label="Aplicar desconto"
        />
      </div>

      {enabled && (
        <>
          {/* Input row: valor à esquerda, R$/% à direita */}
          <div className="flex gap-2">
            {mode === 'amount' ? (
              <MoneyInput
                aria-label="Valor do desconto"
                value={value}
                onChange={(next) => onValueChange(next ?? 0)}
                className={cn(
                  'flex-1',
                  invalid && 'border-destructive bg-destructive/10'
                )}
              />
            ) : (
              <Input
                aria-label="Percentual do desconto"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={value}
                onChange={(event) => onValueChange(Number(event.target.value))}
                className={cn(
                  'flex-1',
                  invalid && 'border-destructive bg-destructive/10'
                )}
              />
            )}

            <ButtonGroup>
              <Button
                type="button"
                variant={mode === 'amount' ? 'default' : 'outline'}
                onClick={() => onModeChange('amount')}
              >
                R$
              </Button>
              <Button
                type="button"
                variant={mode === 'percent' ? 'default' : 'outline'}
                onClick={() => onModeChange('percent')}
              >
                %
              </Button>
            </ButtonGroup>
          </div>

          {invalid && errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          {/* Pricing summary — fundo muted */}
          <div className="flex flex-col gap-1 rounded-md bg-muted/50 px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Referência</span>
              <span>
                {formatCurrency(formatIntegerToDecimal(referencePrice))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-destructive">
                − {formatCurrency(formatIntegerToDecimal(discountAmount))}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Preço final</span>
              <span>
                {formatCurrency(formatIntegerToDecimal(unitFinalPrice))}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
