import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar';

export const SystemLayout = () => {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="bg-zinc-50 dark:bg-zinc-900"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)'
        } as React.CSSProperties
      }
    >
      <SystemLayoutSidebar variant="inset" collapsible="icon" />
      <SidebarInset className="border border-border">
        <SystemLayoutHeader />
        <div className="flex flex-1 flex-col p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
