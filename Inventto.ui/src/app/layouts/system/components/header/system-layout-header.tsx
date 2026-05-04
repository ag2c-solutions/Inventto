import { BellIcon } from 'lucide-react';

import { ToggleTheme } from '@/app/theme/toggle-theme';

import { Button } from '@/shared/components/ui/button';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';

import { UserNav } from '../user-nav';

export const SystemLayoutHeader = () => {
  return (
    <header className="w-full flex items-center justify-between px-4 h-16 border-b">
      <SidebarTrigger className="-ml-1" />
      <section className="flex items-center gap-2">
        <ToggleTheme />
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
