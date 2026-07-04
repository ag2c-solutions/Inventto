import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/utils';

import { getUserNameInitials } from '@/features/users';

export function OrgAvatar({
  name,
  className
}: {
  name: string;
  className?: string;
}) {
  return (
    <Avatar className={cn('rounded-md border', className)}>
      <AvatarFallback className="rounded-md bg-primary text-primary-foreground font-semibold">
        {getUserNameInitials(name).slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
