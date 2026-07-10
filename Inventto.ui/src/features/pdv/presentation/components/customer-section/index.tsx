import { Check, Phone, User } from 'lucide-react';

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
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Cliente</span>
        <span className="text-sm text-muted-foreground">· opcional</span>
      </div>

      {/* Phone input with icon */}
      <div className="relative">
        <label htmlFor="pdv-customer-phone" className="sr-only">
          Telefone do cliente
        </label>
        <Input
          id="pdv-customer-phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="pr-10"
        />
        <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      </div>

      {/* Found customer card */}
      {found && (
        <div className="flex items-center gap-3 rounded-lg bg-sidebar/70 p-3">
          <Avatar className="h-8 w-8 bg-sidebar-accent text-xs">
            <AvatarFallback className="text-xs font-medium">
              {getInitials(found.name)}
            </AvatarFallback>
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

      {/* New customer name input */}
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
