
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, FileText, List } from "lucide-react";
import { 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader
} from "@/components/ui/sidebar";

const SidebarNav = () => {
  const navItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Tickets",
      path: "/tickets",
      icon: <Inbox className="h-5 w-5" />
    },
    {
      title: "Logs",
      path: "/logs",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <List className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Ticket Manager</span>
        </div>
      </SidebarHeader>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    end={item.path === "/"} 
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default SidebarNav;
