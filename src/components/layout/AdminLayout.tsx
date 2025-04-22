
import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { FileTextIcon, LineChartIcon, Users2Icon, LogOutIcon } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isLoading } = useAuth();

  // If authentication is still being checked, show a loading indicator
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex flex-col gap-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <SidebarTrigger />
            </div>
            <div className="text-sm text-gray-500">
              Logged in as: {user.email}
            </div>
            <Separator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/articles">
                  <SidebarMenuButton className="w-full">
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    <span>Articles</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/admin/analytics">
                  <SidebarMenuButton className="w-full">
                    <LineChartIcon className="mr-2 h-5 w-5" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/admin/users">
                  <SidebarMenuButton className="w-full">
                    <Users2Icon className="mr-2 h-5 w-5" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full" onClick={signOut}>
                  <LogOutIcon className="mr-2 h-5 w-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="container py-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
