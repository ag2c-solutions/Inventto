import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, type LucideIcon, Shield, User } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

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

import type { Role } from '@/features/permissions';

import type { IMember } from '../../../../domain/entities';
import {
  memberRoleFormSchema,
  type MemberRoleFormValues
} from '../../../../domain/validators';
import { useUpdateMemberRoleMutation } from '../../../hooks/use-mutations';

interface RoleCellProps {
  member: IMember;
}

export function RoleColumn({ member }: RoleCellProps) {
  const { mutateAsync: updateRole, isPending } = useUpdateMemberRoleMutation();

  const form = useForm<MemberRoleFormValues>({
    resolver: zodResolver(memberRoleFormSchema),
    defaultValues: { role: member.role as MemberRoleFormValues['role'] }
  });

  const currentRole = useWatch({ control: form.control, name: 'role' });
  const isChanged = currentRole !== member.role;

  const roleConfig: Record<
    Role,
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

  async function onSubmit(data: MemberRoleFormValues) {
    try {
      await updateRole({ memberId: member.id, role: data.role });
      form.reset({ role: data.role });
    } catch {
      form.reset({ role: member.role as MemberRoleFormValues['role'] });
    }
  }

  if (member.isMe || member.role === 'owner') {
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
      className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3"
    >
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3">
        <div className="flex justify-start md:w-24">
          <Badge variant="outline" className={cn(config.style)}>
            <Icon className="h-3 w-3 " />
            {config.label}
          </Badge>
        </div>

        <Select
          value={currentRole}
          onValueChange={(val) =>
            form.setValue('role', val as MemberRoleFormValues['role'], {
              shouldDirty: true
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="h-8 w-full text-xs md:w-[100px]">
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
          'h-8 w-full px-2 transition-all border md:w-auto md:border-0 md:opacity-0 md:pointer-events-none',
          isChanged &&
            'bg-primary text-primary-foreground md:opacity-100 md:pointer-events-auto'
        )}
        disabled={!isChanged || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-xs font-bold">Alterar Função</span>
        )}
      </Button>
    </form>
  );
}
