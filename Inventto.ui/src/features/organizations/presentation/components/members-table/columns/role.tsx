import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, type LucideIcon, Shield, User } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import type { UserRole } from '@/features/users';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils';

import type { IMember } from '../../../../domain/entities';
import { useUpdateMemberRoleMutation } from '../../../hooks/use-mutations';

interface RoleCellProps {
  member: IMember;
}

const FormSchema = z.object({
  role: z.enum(['owner', 'manager', 'sales'])
});

export function RoleColumn({ member }: RoleCellProps) {
  const { mutateAsync: updateRole } = useUpdateMemberRoleMutation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { role: member.role }
  });

  const currentRole = useWatch({ control: form.control, name: 'role' });
  const isChanged = currentRole !== member.role;

  const roleConfig: Record<
    UserRole,
    { label: string; icon: LucideIcon; style: string }
  > = {
    owner: {
      label: 'Dono',
      icon: Shield,
      style: 'bg-primary/80 text-primary-foreground border-primary/20'
    },
    manager: {
      label: 'Gerente',
      icon: Shield,
      style: 'bg-violet-500/10 text-violet-700 border-violet-500/20'
    },
    sales: {
      label: 'Vendedor',
      icon: User,
      style: 'bg-slate-200 text-slate-700 border-slate-200'
    }
  };

  const config = roleConfig[currentRole];
  const Icon = config.icon;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    await updateRole({ memberId: member.id, role: data.role })
      .then(() => {
        form.reset({ role: data.role });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (member.isMe) {
    return (
      <Badge variant="outline" className={cn('gap-1 pl-2 pr-3', config.style)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn('w-24 justify-start gap-1', config.style)}
        >
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>

        <Select
          value={currentRole}
          onValueChange={(val) =>
            form.setValue('role', val as UserRole, { shouldDirty: true })
          }
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="sales">Vendedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        size="default"
        variant="ghost"
        className={cn(
          'h-8  px-2 transition-all opacity-0 pointer-events-none',
          isChanged &&
            'opacity-100 pointer-events-auto bg-primary text-primary-foreground'
        )}
        disabled={!isChanged || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-xs font-bold">Alterar Função</span>
        )}
      </Button>
    </form>
  );
}
