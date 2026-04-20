import { Outlet } from 'react-router';
import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar';
import { SidebarInset, SidebarProvider } from '@/app/components/ui/sidebar';

export const SystemLayout = () => {
  return (
    <>
      <SystemLayoutHeader />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-sidebar">
          <SidebarProvider
            style={
              {
                '--sidebar-width': 'calc(var(--spacing) * 68)',
                '--header-height': 'calc(var(--spacing) * 12)'
              } as React.CSSProperties
            }
          >
            <SystemLayoutSidebar variant="inset" collapsible="icon" />
            <SidebarInset>
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
