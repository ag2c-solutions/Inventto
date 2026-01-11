import * as React from 'react';
import { ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';
import { useUser } from '@/app/features/users/hooks/use-user';
import { getUserNameInitials } from '@/app/features/users/utils';

export function OrganizationSwitcher({ className }: { className?: string }) {
  const { organization, availableOrganizations, setCurrentOrganization } =
    useUser();
  const [open, setOpen] = React.useState(false);

  if (!organization) {
    return (
      <div className="flex items-center gap-2 p-2 text-sidebar-foreground/70">
        <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 animate-pulse" />
        <div className="h-4 w-24 bg-sidebar-primary/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecione a organização"
          className={cn(
            'w-full justify-between p-2 hover:bg-accent/50 h-auto',
            className
          )}
        >
          <div className="flex items-center gap-3 truncate">
            <Avatar className="h-6 w-6 rounded-md border">
              <AvatarImage
                src={`https://avatar.vercel.sh/${organization.slug}.png`}
                alt={organization.name}
                className="grayscale"
              />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                {getUserNameInitials(organization.name).slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start truncate text-sm">
              <span className="font-medium truncate max-w-[140px]">
                {organization.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {organization.role === 'owner'
                  ? 'Proprietário'
                  : organization.role}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar organização..." />
          <CommandList>
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>

            <CommandGroup heading="Minhas Organizações">
              {availableOrganizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => {
                    setCurrentOrganization(org.id);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer"
                >
                  <Avatar className="mr-2 h-5 w-5 rounded-sm border">
                    <AvatarFallback className="text-[10px]">
                      {getUserNameInitials(org.name).slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  {org.name}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      organization.id === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // TODO: Navegar para criar nova organização
                  console.log('Navegar para /new-organization');
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Organização
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
