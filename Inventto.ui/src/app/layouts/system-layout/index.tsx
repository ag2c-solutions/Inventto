import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

import { MovementSheet } from '@/features/movements';

import { SystemErrorBoundary } from './components/error-boundary';
import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar';
import { getInitialSidebarState } from './utils/get-sidebar-state';

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
          <SystemErrorBoundary>
            <Outlet />
          </SystemErrorBoundary>
        </div>
      </SidebarInset>

      <MovementSheet />
    </SidebarProvider>
  );
};
