import { NavLink } from 'react-router';
import { navLinks } from '../../consts/navlinks-siderbar';
import { cn } from '@/lib/utils';
import { OrganizationSwitcher } from './organization-switcher';
import { usePermission } from '@/app/features/permissions/hooks/use-permissions';

export const SystemLayoutSidebar = () => {
  const { can } = usePermission();

  const filteredNavLinks = navLinks.filter(({ permission }) => {
    if (!permission) return true;

    return can(permission);
  });

  return (
    <aside className="w-64 h-full min-h-[calc(100vh-6.75rem)] py-2 px-2 rounded-2xl hidden md:block bg-sidebar">
      <div className="h-16 flex items-center mb-8 px-0 border-b">
        <OrganizationSwitcher />
      </div>

      <nav>
        <ul className="space-y-2">
          {filteredNavLinks.map(({ href, icon, label }) => {
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 py-2 px-3 rounded-md font-medium text-sm transition-all duration-200',

                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-primary hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
