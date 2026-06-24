import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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

import type { IMember, MemberStatus } from '../../../../domain/entities';
import {
  memberStatusFormSchema,
  type MemberStatusFormValues
} from '../../../../domain/validators';
import { useUpdateMemberStatusMutation } from '../../../hooks/use-mutations';

interface StatusCellProps {
  member: IMember;
}

export function StatusColumn({ member }: StatusCellProps) {
  const { mutateAsync: updateStatus, isPending } =
    useUpdateMemberStatusMutation();

  const form = useForm<MemberStatusFormValues>({
    resolver: zodResolver(memberStatusFormSchema),
    defaultValues: {
      status: member.status === 'invited' ? 'active' : member.status
    }
  });

  const currentStatus = useWatch({ control: form.control, name: 'status' });
  const isChanged = currentStatus !== member.status;

  const statusConfig: Record<
    MemberStatus,
    { label: string; style: string; dot: string }
  > = {
    active: {
      label: 'Ativo',
      style:
        'text-[var(--status-healthy)] border-[var(--status-healthy)]/30 bg-[var(--status-healthy-soft)]',
      dot: 'bg-[var(--status-healthy)]'
    },
    inactive: {
      label: 'Inativo',
      style:
        'text-[var(--status-zeroed)] border-[var(--status-zeroed)]/30 bg-[var(--status-zeroed-soft)]',
      dot: 'bg-[var(--status-zeroed)]'
    },
    invited: {
      label: 'Convidado',
      style:
        'text-[var(--status-warning)] border-[var(--status-warning)]/30 bg-[var(--status-warning-soft)]',
      dot: 'bg-[var(--status-warning)]'
    }
  };

  const currentConfig = statusConfig[currentStatus];

  async function onSubmit(data: MemberStatusFormValues) {
    await updateStatus({
      memberId: member.id,
      status: data.status
    });
  }

  if (member.isMe) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-2 py-1 justify-start w-[90px] transition-colors',
          currentConfig.style
        )}
      >
        <span className={cn('size-1.5 rounded-full', currentConfig.dot)} />
        {currentConfig.label}
      </Badge>
    );
  }

  // Convidado é estado de sistema (aguardando 1º acesso): badge fixo, sem edição.
  if (member.status === 'invited') {
    const invitedConfig = statusConfig.invited;
    return (
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn(
            'gap-2 py-1 justify-start w-[90px]',
            invitedConfig.style
          )}
        >
          <span className={cn('size-1.5 rounded-full', invitedConfig.dot)} />
          {invitedConfig.label}
        </Badge>
        <span className="text-xs italic text-muted-foreground">
          aguardando 1º acesso
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-center gap-6"
    >
      <div className="flex items-center gap-4">
        <Badge
          variant="default"
          className={cn(
            'gap-2 py-1 justify-start w-[90px] transition-colors',
            currentConfig.style
          )}
        >
          <span className={cn('size-1.5 rounded-full', currentConfig.dot)} />
          {currentConfig.label}
        </Badge>
        <Select
          value={currentStatus}
          onValueChange={(val) =>
            form.setValue('status', val as MemberStatusFormValues['status'], {
              shouldDirty: true
            })
          }
          disabled={isPending}
        >
          <SelectTrigger className="h-6 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
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
        disabled={!isChanged || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-xs font-bold">Alterar Status</span>
        )}
      </Button>
    </form>
  );
}
