import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ImageIcon, Lock, LogOut } from 'lucide-react';

import { useSignOutMutation } from '@/features/auth';
import {
  AvatarChangeForm,
  ChangePasswordForm,
  getUserNameInitials,
  useUser
} from '@/features/users';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';

type DialogType = 'avatar' | 'password' | null;

export function UserNav() {
  const { user, organization } = useUser();
  const { mutateAsync } = useSignOutMutation();
  const navigate = useNavigate();
  const [dialogType, setDialogType] = useState<DialogType>(null);

  const initials = user?.fullName ? getUserNameInitials(user.fullName) : '';

  const handleSignOut = async () => {
    await mutateAsync()
      .then(() => {
        navigate('/auth/login', { replace: true });
      })
      .catch(() => {
        return;
      });
  };

  //if (!user) return null;

  return (
    <>
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
              <p className="text-sm font-medium leading-none">
                {user?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {organization?.name || 'Minha Empresa'}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setDialogType('avatar')}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Alterar Avatar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setDialogType('password')}
            >
              <Lock className="mr-2 h-4 w-4" />
              <span>Alterar Senha</span>
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

      <Dialog
        open={!!dialogType}
        onOpenChange={(open) => !open && setDialogType(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'avatar' ? 'Alterar Avatar' : 'Alterar Senha'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'avatar'
                ? 'Faça o upload de uma nova imagem para seu perfil.'
                : 'Defina uma nova senha segura para sua conta.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {dialogType === 'avatar' && (
              <AvatarChangeForm
                onSuccess={() => setDialogType(null)}
                onCancel={() => setDialogType(null)}
              />
            )}

            {dialogType === 'password' && (
              <ChangePasswordForm
                onSuccess={() => setDialogType(null)}
                onCancel={() => setDialogType(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
