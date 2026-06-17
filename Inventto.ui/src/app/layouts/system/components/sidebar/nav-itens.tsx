import { NavLink, useLocation } from 'react-router';

import { usePermission } from '@/features/permissions';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/shared/components/ui/sidebar';

import { navGroups } from '../../constants/navlinks-sidebar';

export const NavItens = () => {
  const { can, isLoading } = usePermission();
  const { pathname } = useLocation();

  if (isLoading) return null;

  return (
    <>
      {navGroups.map(({ group, items }) => {
        const visibleItems = items.filter(
          ({ enabled, permission }) =>
            enabled !== false && (!permission || can(permission))
        );

        if (visibleItems.length === 0) return null;

        return (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarMenu>
              {visibleItems.map(({ href, icon: Icon, label }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href);

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <NavLink to={href} end={href === '/'}>
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
};
