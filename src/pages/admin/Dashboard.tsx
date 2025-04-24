
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartIcon, FileTextIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BreakingNewsManager from "@/components/admin/BreakingNewsManager";

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0,
    totalContacts: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [articlesResponse, commentsResponse, likesResponse, contactsResponse] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact' }),
          supabase.from('comments').select('id', { count: 'exact' }),
          supabase.from('likes').select('id', { count: 'exact' }),
          supabase.from('contacts').select('id', { count: 'exact' })
        ]);

        setStats({
          totalArticles: articlesResponse.count || 0,
          totalComments: commentsResponse.count || 0,
          totalLikes: likesResponse.count || 0,
          totalContacts: contactsResponse.count || 0
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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p className="text-xs text-muted-foreground">User engagement</p>
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
            <p className="text-xs text-muted-foreground">Content performance</p>
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

      <div className="mt-8">
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
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Admin Portal</CardTitle>
            <CardDescription>
              Manage your news magazine from this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the sidebar to navigate between different admin sections:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Articles</strong> - Create, edit, and manage your content</li>
              <li><strong>Analytics</strong> - View performance metrics and user engagement</li>
              <li><strong>Users</strong> - Manage user accounts and permissions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
