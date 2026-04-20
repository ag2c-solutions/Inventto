import { BellIcon } from 'lucide-react';
import { Logo } from '@/app/components/shared/logo';
import { Button } from '@/app/components/ui/button';
import { UserNav } from '../user-nav';
import { ToggleTheme } from '@/app/theme/toggle-theme';

export const SystemLayoutHeader = () => {
  return (
    <header className="sticky bg-sidebar top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-sidebar flex items-center justify-between px-4  h-16">
      <Logo />
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
