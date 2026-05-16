import { ProtectedLink } from '@/features/permissions';

import { SidebarMenuButton } from '@/shared/components/ui/sidebar';
import { cn } from '@/shared/utils';

import { navLinks } from '../../constants/navlinks-sidebar';

export const NavItens = () => {
  return (
    <nav>
      <ul className="space-y-2">
        {navLinks.map(({ href, icon: Icon, label, permission }) => {
          return (
            <li key={href}>
              <ProtectedLink
                required={permission}
                to={href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 py-2 px-3 rounded-md font-medium text-sm transition-all duration-200 overflow-hidden',
                    isActive && 'bg-primary text-primary-foreground shadow-md'
                  )
                }
              >
                <SidebarMenuButton tooltip={label}>
                  {<Icon className="w-5 h-5" />}
                  <span>{label}</span>
                </SidebarMenuButton>
              </ProtectedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
