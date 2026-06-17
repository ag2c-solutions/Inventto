import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { useUser } from '@/features/users';
import { getUserNameInitials } from '@/features/users';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/shared/components/ui/sidebar';
import { cn } from '@/shared/utils';

import { CreateOrganizationDialog } from '../create-organization-dialog';

export function OrganizationSwitcher() {
  const {
    currentOrganization: organization,
    availableOrganizations,
    setCurrentOrganization
  } = useUser();
  const [open, setOpen] = useState(false);

  if (!organization) {
    return (
      <div className="flex items-center gap-2 p-2 text-sidebar-foreground/70">
        <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 animate-pulse" />
        <div className="h-4 w-24 bg-sidebar-primary/20 rounded animate-pulse group-data-[collapsible=icon]:hidden" />
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="px-3">
              <SidebarMenuButton
                size="lg"
                className="overflow-hidden data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div>
                  <Avatar className="h-8 w-8 rounded-md border">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${organization.slug}.png`}
                      alt={organization.name}
                      className="grayscale"
                    />
                    <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                      {getUserNameInitials(organization.name).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                  <span className="truncate font-medium">
                    {organization?.name}
                  </span>
                  <span className="truncate text-xs">{organization?.role}</span>
                </div>
                <ChevronsUpDown className="ml-auto shrink-0 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0" />
              </SidebarMenuButton>
            </div>
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
                          organization.id === org.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    asChild
                    onSelect={() => setOpen(false)}
                    className="cursor-pointer"
                  >
                    <CreateOrganizationDialog />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
