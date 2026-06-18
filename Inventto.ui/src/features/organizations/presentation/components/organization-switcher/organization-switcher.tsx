import { Check, ChevronsUpDown } from 'lucide-react';

import { ROLES_NAME } from '@/features/permissions';

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
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils';

import { CreateOrganizationDialog } from '../create-organization-dialog';
import { OrgAvatar } from '../org-avatar';

import { StaticTrigger } from './static-trigger';
import { useOrganizationSwitcher } from './use-organization-switcher';

export function OrganizationSwitcher() {
  const {
    open,
    setOpen,
    currentOrganization,
    availableOrganizations,
    isStaticTrigger,
    handleSelect
  } = useOrganizationSwitcher();

  if (!currentOrganization) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <Skeleton className="size-8 rounded-md shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
        </div>
      </div>
    );
  }

  const roleLabel =
    ROLES_NAME[currentOrganization.role as keyof typeof ROLES_NAME] ??
    currentOrganization.role;

  if (isStaticTrigger) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <StaticTrigger
            name={currentOrganization.name}
            role={currentOrganization.role}
          />
        </SidebarMenuItem>
      </SidebarMenu>
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
                className="overflow-hidden border rounded-lg bg-background hover:bg-background"
              >
                <OrgAvatar
                  name={currentOrganization.name}
                  className="size-8 shrink-0"
                />

                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                  <span className="truncate font-medium">
                    {currentOrganization.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                </div>

                <ChevronsUpDown
                  data-icon="inline-end"
                  className="ml-auto shrink-0 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0"
                />
              </SidebarMenuButton>
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="p-0"
            align="start"
            alignOffset={12}
            style={{
              width: 'calc(var(--radix-popover-trigger-width) - 1.5rem)'
            }}
          >
            <Command>
              <CommandInput placeholder="Buscar organização…" />
              <CommandList>
                <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>

                <CommandGroup heading="Minhas organizações">
                  {availableOrganizations.map((org) => {
                    const isActive = currentOrganization.id === org.id;
                    const orgRoleLabel =
                      ROLES_NAME[org.role as keyof typeof ROLES_NAME] ??
                      org.role;

                    return (
                      <CommandItem
                        key={org.id}
                        value={org.name}
                        onSelect={() => handleSelect(org.id)}
                        className="cursor-pointer"
                      >
                        <OrgAvatar
                          name={org.name}
                          className="size-6 shrink-0 text-[10px]"
                        />
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {org.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {orgRoleLabel}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            'ml-auto shrink-0',
                            isActive ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    asChild
                    onSelect={() => setOpen(false)}
                    className="cursor-pointer p-0"
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
