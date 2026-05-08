import { OrganizationSwitcher } from '@/features/organizations';

import { Logo } from '@/app/brand/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader
} from '@/shared/components/ui/sidebar';

import { NavItens } from './nav-itens';

export const SystemLayoutSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="mb-10">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <div className="mb-6">
          <OrganizationSwitcher />
        </div>
        <NavItens />
      </SidebarContent>
    </Sidebar>
  );
};
