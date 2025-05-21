
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  SidebarProvider, 
  SidebarContent,
  Sidebar,
  SidebarTrigger, 
} from "@/components/ui/sidebar";
import SidebarNav from "./SidebarNav";
import TopBar from "./TopBar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
