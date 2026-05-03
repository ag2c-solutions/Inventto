import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar';

export const SystemLayout = () => {
  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-sidebar">
        <SidebarProvider
          defaultOpen={false}
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 68)'
            } as React.CSSProperties
          }
        >
          <SystemLayoutSidebar variant="inset" collapsible="icon" />
          <SidebarInset>
            <SystemLayoutHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
};
