import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils';

import type { IMember } from '../../../domain/entities';
import { RoleColumn } from '../members-table/columns/role';
import { StatusColumn } from '../members-table/columns/status';

interface MemberCardProps {
  member: IMember;
}

export function MemberCard({ member }: MemberCardProps) {
  const isMuted = member.status === 'invited' || member.status === 'inactive';

  return (
    <div
      className={cn(
        'rounded-lg border bg-sidebar/50 p-4 space-y-4',
        member.status === 'inactive' && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
          <AvatarFallback
            className={cn(isMuted && 'bg-muted/60 text-muted-foreground')}
          >
            {member.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {member.name}{' '}
            {member.isMe && (
              <span className="text-muted-foreground text-xs ml-1">(Você)</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">{member.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Função
          </span>
          <RoleColumn member={member} />
        </div>
        <div className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </span>
          <StatusColumn member={member} />
        </div>
      </div>
    </div>
  );
}
