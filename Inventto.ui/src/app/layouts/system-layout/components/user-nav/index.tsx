import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

import { useSignOutMutation } from '@/features/auth';
import {
  AvatarChange,
  getUserNameInitials,
  PasswordChange,
  useUser
} from '@/features/users';

export function UserNav() {
  const { user, currentOrganization: organization } = useUser();
  const { mutateAsync } = useSignOutMutation();
  const navigate = useNavigate();

  const initials = user?.fullName ? getUserNameInitials(user.fullName) : '';

  const handleSignOut = async () => {
    await mutateAsync().then(() => {
      navigate('/auth/login', { replace: true });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 rounded-full p-0 lg:rounded-lg  lg:bg-background lg:px-2 lg:py-1.5 lg:hover:bg-accent"
        >
          <Avatar className="size-9 border border-primary/20">
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 max-w-40 flex-col text-left leading-tight lg:flex">
            <span className="truncate text-sm font-medium">
              {user?.fullName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {organization?.name || 'Minha Empresa'}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="truncate text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <AvatarChange />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <PasswordChange />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut />
          <span>Sair do sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
