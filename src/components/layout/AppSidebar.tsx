import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FolderOpen, FileText, ClipboardList, CreditCard, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Expedientes", url: "/expedientes", icon: FolderOpen },
  { title: "Tipos de Trámite", url: "/tipos-tramite", icon: FileText },
  { title: "Documentos Requeridos", url: "/documentos-requeridos", icon: ClipboardList },
  { title: "Configuración", url: "/configuracion", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { role } = useUserRole();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
