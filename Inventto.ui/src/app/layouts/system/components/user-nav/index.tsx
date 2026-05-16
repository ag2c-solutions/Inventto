import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';

import { useSignOutMutation } from '@/features/auth';
import {
  AvatarChange,
  getUserNameInitials,
  PasswordChange,
  useUser
} from '@/features/users';

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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-input">
            <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {organization?.name || 'Minha Empresa'}
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
          className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair do sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
