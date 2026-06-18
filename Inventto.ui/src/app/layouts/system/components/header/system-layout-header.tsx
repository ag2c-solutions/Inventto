import { BellIcon } from 'lucide-react';

import { Logo } from '@/app/brand/logo';
import { ToggleTheme } from '@/app/theme/toggle-theme';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';

import { UserNav } from '../user-nav';

import { AppBreadcrumb } from './breadcrumb';

export const SystemLayoutHeader = () => {
  return (
    <header className="w-full flex items-center justify-between px-4 h-14 lg:h-16 border-b shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Logo variant="compact" className="lg:hidden" />
        <Separator orientation="vertical" className="h-4 hidden lg:block" />
        <div className="hidden lg:block">
          <AppBreadcrumb />
        </div>
      </div>
      <section className="flex items-center gap-3">
        <div className="hidden lg:block">
          <ToggleTheme />
        </div>
        <Button
          variant={'outline'}
          size={'icon'}
          className="rounded-full cursor-pointer"
        >
          <BellIcon />
        </Button>
        <UserNav />
      </section>
    </header>
  );
};
