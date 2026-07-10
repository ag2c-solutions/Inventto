import { Check } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Input } from '@/shared/components/ui/input';

import type { SaleCustomerInput } from '../../../domain/entities';

import { useCustomerLookup } from './hooks/use-customer-lookup';

interface CustomerSectionProps {
  onChange: (customer: SaleCustomerInput | null) => void;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatSince(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  });
}

export function CustomerSection({ onChange }: CustomerSectionProps) {
  const { phone, setPhone, name, setName, found, isNew } =
    useCustomerLookup(onChange);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="pdv-customer-phone" className="text-sm font-medium">
          Telefone do cliente
        </label>
        <Input
          id="pdv-customer-phone"
          type="tel"
          placeholder="Telefone do cliente"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          Opcional — para registrar no histórico do cliente.
        </span>
      </div>

      {found && (
        <div className="flex items-center gap-2 rounded-md border p-2">
          <Avatar>
            <AvatarFallback>{getInitials(found.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{found.name}</span>
            <span className="text-xs text-muted-foreground">
              cliente desde {formatSince(found.since)}
            </span>
          </div>
          <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
        </div>
      )}

      {isNew && (
        <div className="flex flex-col gap-1">
          <Input
            aria-label="Nome"
            placeholder="Nome do cliente"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            Cliente novo — será criado ao confirmar a venda.
          </span>
        </div>
      )}
    </div>
  );
}
