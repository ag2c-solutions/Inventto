import { ROLES_NAME } from '@/features/permissions';

import { SidebarMenuButton } from '@/shared/components/ui/sidebar';

import { OrgAvatar } from '../org-avatar';

export function StaticTrigger({
  name,
  role
}: {
  name: string;
  role: string | undefined;
}) {
  return (
    <div className="px-3">
      <SidebarMenuButton
        size="lg"
        className="cursor-default border rounded-lg bg-background hover:bg-background"
      >
        <OrgAvatar name={name} className="size-8" />
        <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
          <span className="truncate font-medium">{name}</span>
          {role && (
            <span className="truncate text-xs text-muted-foreground">
              {ROLES_NAME[role as keyof typeof ROLES_NAME] ?? role}
            </span>
          )}
        </div>
      </SidebarMenuButton>
    </div>
  );
}
