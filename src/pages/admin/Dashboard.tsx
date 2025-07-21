
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

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0,
    totalContacts: 0,
    totalSubscriptions: 0,
    pendingComments: 0
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
          pendingCommentsResponse
        ] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact' }),
          supabase.from('comments').select('id', { count: 'exact' }),
          supabase.from('likes').select('id', { count: 'exact' }),
          supabase.from('contacts').select('id', { count: 'exact' }),
          supabase.from('subscriptions').select('id', { count: 'exact' }),
          supabase.from('comments').select('id', { count: 'exact' }).eq('status', 'pending')
        ]);

        setStats({
          totalArticles: articlesResponse.count || 0,
          totalComments: commentsResponse.count || 0,
          totalLikes: likesResponse.count || 0,
          totalContacts: contactsResponse.count || 0,
          totalSubscriptions: subscriptionsResponse.count || 0,
          pendingComments: pendingCommentsResponse.count || 0
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : stats.totalArticles}
              </div>
              <p className="text-xs text-muted-foreground">Published content</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : stats.totalComments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingComments} pending review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
              <MailIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : stats.totalSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground">Active subscribers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : stats.totalLikes}
              </div>
              <p className="text-xs text-muted-foreground">Content engagement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : stats.totalContacts}
              </div>
              <p className="text-xs text-muted-foreground">User inquiries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="breaking-news" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="breaking-news">Breaking News</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
            <TabsTrigger value="admin-users">Admin Users</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

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
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Quick Actions</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Use the tabs above to quickly manage breaking news, newsletters, and admin users without navigating away from the dashboard.
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
