import { Wallet, X } from 'lucide-react';

import {
  FilePicker,
  FilePickerButton,
  FilePickerError,
  FilePickerInput
} from '@/shared/components/common/file-picker';
import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { MoneyInput } from '@/shared/components/ui/money-input';
import { cn, formatIntegerToDecimal } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils/formatters/format-currency';

import type { PaymentMethod } from '../../../domain/entities';
import { PAYMENT_METHOD_LABELS } from '../../constants';

import {
  type PaymentSectionValue,
  usePaymentSection
} from './hooks/use-payment-section';

const PAYMENT_METHODS = (
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }));

interface PaymentSectionProps {
  // Total da venda, em centavos — usado pro cálculo de troco/validação.
  total: number;
  onChange: (payment: PaymentSectionValue) => void;
}

export function PaymentSection({ total, onChange }: PaymentSectionProps) {
  const {
    method,
    setMethod,
    amountPaid,
    setAmountPaid,
    proofFiles,
    setProofFiles,
    isInsufficientCash,
    changeAmount
  } = usePaymentSection(total, onChange);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Forma de pagamento</span>
      </div>

      <ButtonGroup>
        {PAYMENT_METHODS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            className="flex-1"
            variant={method === value ? 'default' : 'outline'}
            onClick={() => setMethod(value)}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>

      {method === 'cash' && (
        <div className="flex flex-col gap-1">
          <label htmlFor="pdv-amount-paid" className="text-sm font-medium">
            Valor recebido
          </label>
          <MoneyInput
            id="pdv-amount-paid"
            value={amountPaid}
            onChange={setAmountPaid}
            className={cn(isInsufficientCash && 'border-destructive')}
          />
          {isInsufficientCash ? (
            <span className="text-xs text-destructive">
              O valor recebido é menor que o total da venda.
            </span>
          ) : (
            changeAmount != null &&
            changeAmount > 0 && (
              <span className="text-xs text-muted-foreground">
                Troco: {formatCurrency(formatIntegerToDecimal(changeAmount))}
              </span>
            )
          )}
        </div>
      )}

      {(method === 'card' || method === 'pix') && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Anexar comprovante (opcional)
          </span>
          {proofFiles.length > 0 ? (
            <div className="flex items-center gap-3 rounded-md border p-2">
              <img
                src={proofFiles[0].url}
                alt={proofFiles[0].name}
                className="size-12 shrink-0 rounded object-cover"
              />
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {proofFiles[0].name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => setProofFiles([])}
                aria-label="Remover comprovante"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <FilePicker
              files={proofFiles}
              onFilesChange={setProofFiles}
              maxFiles={1}
              maxSizeMB={5}
              accept="image/png, image/jpeg, image/webp"
            >
              <FilePickerInput />
              <label className="cursor-pointer">
                <FilePickerButton label="Anexar comprovante" />
              </label>
              <FilePickerError />
            </FilePicker>
          )}
        </div>
      )}
    </div>
  );
}
