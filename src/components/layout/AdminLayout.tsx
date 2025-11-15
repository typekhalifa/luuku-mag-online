
import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useInactivitySignOut } from "@/hooks/useInactivitySignOut";
import { UnauthorizedAccess } from "./UnauthorizedAccess";
import { SecurityEventLogger } from "@/components/security/SecurityEventLogger";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { FileTextIcon, LineChartIcon, Users2Icon, LogOutIcon, MessageSquareIcon, SunIcon, MoonIcon, CreditCardIcon, MailIcon } from "lucide-react";
import { useTheme } from "next-themes";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const { theme, setTheme } = useTheme();
  
  // Auto sign out after 5 minutes of inactivity
  useInactivitySignOut(5);

  // If authentication or role check is still being processed, show loading
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user doesn't have admin role, show unauthorized access page
  if (!isAdmin) {
    // Log unauthorized access attempt
    SecurityEventLogger.logUnauthorizedAccess('admin_panel', {
      userId: user.id,
      email: user.email
    });
    
    return <UnauthorizedAccess />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex flex-col gap-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8 p-0"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                </Button>
                <SidebarTrigger />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Logged in as: {user.email}
            </div>
            <Separator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin">
                  <SidebarMenuButton className="w-full">
                    <LineChartIcon className="mr-2 h-5 w-5" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/admin/articles">
                  <SidebarMenuButton className="w-full">
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    <span>Articles</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/admin/comments">
                  <SidebarMenuButton className="w-full">
                    <MessageSquareIcon className="mr-2 h-5 w-5" />
                    <span>Comments</span>
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
                <Link to="/admin/newsletter">
                  <SidebarMenuButton className="w-full">
                    <MailIcon className="mr-2 h-5 w-5" />
                    <span>Newsletter</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full" onClick={() => {
                  // Navigate to donations tab in dashboard
                  const dashboardUrl = '/admin?tab=donations';
                  window.location.href = dashboardUrl;
                }}>
                  <CreditCardIcon className="mr-2 h-5 w-5" />
                  <span>Donations</span>
                </SidebarMenuButton>
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
