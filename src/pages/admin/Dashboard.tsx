
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChartIcon, FileTextIcon, MessageSquareIcon, UsersIcon, MailIcon, CrownIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BreakingNewsManager from "@/components/admin/BreakingNewsManager";
import NewsletterManager from "@/components/admin/NewsletterManager";
import AdminUserManager from "@/components/admin/AdminUserManager";
import ContactMessagesManager from "@/components/admin/ContactMessagesManager";
import UserRolesManager from "@/components/admin/UserRolesManager";
import AnalyticsGrowth from "@/components/admin/AnalyticsGrowth";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import DonationAnalytics from "@/components/admin/DonationAnalytics";
import PaymentSettingsManager from "@/components/admin/PaymentSettingsManager";
import EnhancedSiteSettingsManager from "@/components/admin/EnhancedSiteSettingsManager";

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0,
    totalContacts: 0,
    totalSubscriptions: 0,
    pendingComments: 0,
    totalDonations: 0,
    totalDonationAmount: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          articlesResponse,
          commentsResponse,
          likesResponse,
          contactsResponse,
          subscriptionsResponse,
          pendingCommentsResponse,
          donationsResponse,
          donationsAmountResponse
        ] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact' }),
          supabase.from('comments').select('id', { count: 'exact' }),
          supabase.from('likes').select('id', { count: 'exact' }),
          supabase.from('contacts').select('id', { count: 'exact' }),
          supabase.from('subscriptions').select('id', { count: 'exact' }),
          supabase.from('comments').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('donations').select('id', { count: 'exact' }),
          supabase.from('donations').select('amount')
        ]);

        const totalDonationAmount = donationsAmountResponse.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        setStats({
          totalArticles: articlesResponse.count || 0,
          totalComments: commentsResponse.count || 0,
          totalLikes: likesResponse.count || 0,
          totalContacts: contactsResponse.count || 0,
          totalSubscriptions: subscriptionsResponse.count || 0,
          pendingComments: pendingCommentsResponse.count || 0,
          totalDonations: donationsResponse.count || 0,
          totalDonationAmount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your news magazine</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Articles</CardTitle>
              <FileTextIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {loading ? "Loading..." : stats.totalArticles}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Published content</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Comments</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {loading ? "Loading..." : stats.totalComments}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {stats.pendingComments} pending review
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Newsletter Subscribers</CardTitle>
              <MailIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {loading ? "Loading..." : stats.totalSubscriptions}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Active subscribers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950 dark:to-red-900 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Likes</CardTitle>
              <LineChartIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {loading ? "Loading..." : stats.totalLikes}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">Content engagement</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Contact Messages</CardTitle>
              <UsersIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {loading ? "Loading..." : stats.totalContacts}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">User inquiries</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-950 dark:to-emerald-900 dark:border-emerald-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Donations</CardTitle>
              <LineChartIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {loading ? "Loading..." : `$${stats.totalDonationAmount.toLocaleString()}`}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{stats.totalDonations} donations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-2 bg-muted rounded-lg">
            <TabsTrigger value="security" className="shrink-0">Security</TabsTrigger>
            <TabsTrigger value="breaking-news" className="shrink-0">Breaking News</TabsTrigger>
            <TabsTrigger value="newsletter" className="shrink-0">Newsletter</TabsTrigger>
            <TabsTrigger value="contacts" className="shrink-0">Contact Messages</TabsTrigger>
            <TabsTrigger value="admin-users" className="shrink-0">Admin Users</TabsTrigger>
            <TabsTrigger value="user-roles" className="shrink-0">User Roles</TabsTrigger>
            <TabsTrigger value="analytics" className="shrink-0">Analytics</TabsTrigger>
            <TabsTrigger value="donations" className="shrink-0">Donations</TabsTrigger>
            <TabsTrigger value="payment-settings" className="shrink-0">Payment Settings</TabsTrigger>
            <TabsTrigger value="site-settings" className="shrink-0">Site Settings</TabsTrigger>
            <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CrownIcon className="h-5 w-5" />
                  Security Monitor
                </CardTitle>
                <CardDescription>
                  Monitor security threats, blocked attacks, and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breaking-news">
            <Card>
              <CardHeader>
                <CardTitle>Manage Breaking News</CardTitle>
                <CardDescription>
                  Add, edit, and manage breaking news items that appear in the ticker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BreakingNewsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Management</CardTitle>
                <CardDescription>
                  Manage your newsletter subscribers and send campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <ContactMessagesManager />
          </TabsContent>

          <TabsContent value="admin-users">
            <Card>
              <CardHeader>
                <CardTitle>Admin User Management</CardTitle>
                <CardDescription>
                  Manage admin users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-roles">
            <UserRolesManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsGrowth />
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donation Management</CardTitle>
                <CardDescription>
                  View donation analytics and track fundraising progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonationAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-settings">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure donation and payment method settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site-settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  Configure site information, SEO, Open Graph tags, and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedSiteSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to the Admin Portal</CardTitle>
                <CardDescription>
                  Manage your news magazine from this comprehensive dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Use the sidebar to navigate between different admin sections:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Articles</strong> - Create, edit, and manage your content</li>
                    <li><strong>Comments</strong> - Moderate user comments and handle reports</li>
                    <li><strong>Analytics</strong> - View performance metrics and user engagement</li>
                    <li><strong>Users</strong> - Manage user accounts and permissions</li>
                    <li><strong>Donations</strong> - Track fundraising and donation analytics</li>
                    <li><strong>Payment Settings</strong> - Configure payment methods and donation settings</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Quick Actions</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Use the tabs above to quickly manage breaking news, newsletters, donations, and payment settings without navigating away from the dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
