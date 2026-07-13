import { Link } from 'react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils';

import type { Role } from '@/features/permissions';

interface ShortcutSpec {
  label: string;
  href: string;
  primary?: boolean;
}

const MANAGER_SHORTCUTS: ShortcutSpec[] = [
  { label: 'Nova venda', href: '/pdv', primary: true },
  { label: 'Entrada de estoque', href: '/movements' },
  { label: 'Produto', href: '/products/create' }
];

const SALES_SHORTCUTS: ShortcutSpec[] = [
  { label: 'Nova venda', href: '/pdv', primary: true }
];

interface ShortcutsProps {
  role: Role;
  // 'compact': fileira de atalhos ao lado do título do bloco (Manager/Owner).
  // 'large': botão único e grande abaixo das últimas vendas (Sales).
  variant?: 'compact' | 'large';
}

export function Shortcuts({ role, variant = 'compact' }: ShortcutsProps) {
  const shortcuts = role === 'sales' ? SALES_SHORTCUTS : MANAGER_SHORTCUTS;
  const isLarge = variant === 'large';

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 justify-between',
        isLarge && 'w-full'
      )}
    >
      <div className="flex items-center gap-2 px-2">
        <h2 className="text-md text-sidebar-foreground/75 font-bold tracking-wide uppercase">
          Atividade & Atalhos
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {shortcuts.map((shortcut) => (
          <Button
            key={shortcut.href}
            asChild
            variant={shortcut.primary ? 'default' : 'outline'}
            className={cn(
              isLarge
                ? 'h-12 min-w-[150px] flex-1 gap-2 rounded-xl text-sm'
                : 'h-8 gap-1.5 rounded-lg px-3 text-xs'
            )}
          >
            <Link to={shortcut.href}>
              <Plus className={isLarge ? 'size-4' : 'size-3.5'} />
              {shortcut.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
