import { Sidebar, SidebarContent, SidebarHeader } from "@/app/components/ui/sidebar"
import { OrganizationSwitcher } from "@/app/features/organizations/components/organizations-list"
import { NavItens } from "./nav-itens"

export const SystemLayoutSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="mb-6">
                <OrganizationSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavItens />
            </SidebarContent>
        </Sidebar>
    )
}