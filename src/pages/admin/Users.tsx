
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUserManager from "@/components/admin/AdminUserManager";
import EnhancedSiteSettingsManager from "@/components/admin/EnhancedSiteSettingsManager";
import PaymentSettingsManager from "@/components/admin/PaymentSettingsManager";
import EmailSettingsManager from "@/components/admin/EmailSettingsManager";
import EnhancedSEOManager from "@/components/admin/EnhancedSEOManager";
import { Users2Icon, SettingsIcon, CreditCardIcon, MailIcon, SearchIcon } from "lucide-react";

const Users: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings & Management</h1>
          <p className="text-muted-foreground">Manage users, site settings, payments, and more</p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="site-settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              SEO & Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage admin users, editors, and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site-settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  Configure your website's basic settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedSiteSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment gateways, donation settings, and subscription options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure SMTP settings, email templates, and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Performance</CardTitle>
                <CardDescription>
                  Optimize your site for search engines and improve performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedSEOManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Users;
