import { type ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import type { IMember } from '../../../types';
import { StatusColumn } from './status';
import { RoleColumn } from './role';

export const columns: ColumnDef<IMember>[] = [
  {
    accessorKey: 'profile',
    header: 'Membro',
    enableGlobalFilter: true,
    accessorFn: (row) => `${row.name} ${row.email}`, 
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
            <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {member.name} {member.isMe && <span className="text-muted-foreground text-xs ml-1">(Você)</span>}
            </span>
            <span className="text-xs text-muted-foreground">{member.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Função',
    filterFn: 'equalsString',
    cell: ({ row }) => <RoleColumn member={row.original} />,
  },

  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ row }) => <StatusColumn member={row.original} />
  }
];