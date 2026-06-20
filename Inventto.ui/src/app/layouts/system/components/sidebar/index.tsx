import { XIcon } from 'lucide-react';

import { Logo } from '@/app/brand/logo';

import { OrganizationSwitcher } from '@/features/organizations';

import { Button } from '@/shared/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar
} from '@/shared/components/ui/sidebar';

import { NavItens } from './nav-itens';

export const SystemLayoutSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { isMobile, setOpenMobile, open } = useSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader className={isMobile ? 'relative mb-4' : 'mb-10'}>
        <Logo variant={isMobile ? 'compact' : 'default'} showText={open} />
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-14 top-2 size-10 rounded-xl bg-background shadow-sm"
            onClick={() => setOpenMobile(false)}
            aria-label="Fechar menu"
          >
            <XIcon className="size-5" />
          </Button>
        )}
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
