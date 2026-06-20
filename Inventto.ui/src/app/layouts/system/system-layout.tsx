import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

function getInitialSidebarState(): boolean {
  if (typeof document === 'undefined') return true;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
  if (!match) return true;
  return match.split('=')[1] === 'true';
}

export const SystemLayout = () => {
  return (
    <SidebarProvider
      defaultOpen={getInitialSidebarState()}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)'
        } as React.CSSProperties
      }
    >
      <SystemLayoutSidebar variant="inset" collapsible="icon" />
      <SidebarInset className="border-0 lg:border border-border m-0 lg:peer-data-[variant=inset]:m-2 lg:peer-data-[variant=inset]:ml-0 lg:peer-data-[variant=inset]:rounded-xl lg:peer-data-[variant=inset]:shadow-sm lg:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2">
        <SystemLayoutHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
