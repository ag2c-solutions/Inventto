import { usePermission } from "@/app/features/permissions/hooks/use-permissions";
import { cn } from "@/lib/utils"
import { NavLink } from "react-router"
import { navLinks } from "../../consts/navlinks-siderbar";
import { SidebarMenuButton } from "@/app/components/ui/sidebar";

export const NavItens = () => {
    const { can } = usePermission();

    const filteredNavLinks = navLinks.filter(({ permission }) => {
        if (!permission) return true;

        return can(permission);
    });
    return (
        <nav>
            <ul className="space-y-2">
                {filteredNavLinks.map(({ href, icon, label }) => {
                    return (
                        <li key={href}>
                            <NavLink
                                to={href}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-4 py-2 px-3 rounded-md font-medium text-sm transition-all duration-200 overflow-hidden',
                                        isActive && 'bg-primary text-primary-foreground shadow-md'
                                    )
                                }
                            >
                                <SidebarMenuButton tooltip={label}>
                                    {icon}
                                    <span>{label}</span>
                                </SidebarMenuButton>
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    )
}