import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUpIcon, 
  EyeIcon, 
  HeartIcon, 
  MessageCircleIcon,
  UsersIcon,
  BarChartIcon
} from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribers: number;
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    likes_count: number;
  }>;
  engagementRate: number;
}

const AnalyticsGrowth: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalSubscribers: 0,
    topArticles: [],
    engagementRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch total views
      const { data: articlesData } = await supabase
        .from("articles")
        .select("views, title, id");
      
      const totalViews = articlesData?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;

      // Fetch total likes
      const { count: totalLikes } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true });

      // Fetch total comments
      const { count: totalComments } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });

      // Fetch total subscribers
      const { count: totalSubscribers } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true });

      // Get top articles by views
      const topArticles = articlesData
        ?.sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(article => ({
          id: article.id,
          title: article.title,
          views: article.views || 0,
          likes_count: 0 // Will be populated separately if needed
        })) || [];

      // Calculate engagement rate (simplified)
      const engagementRate = totalViews > 0 ? 
        ((totalLikes || 0) + (totalComments || 0)) / totalViews * 100 : 0;

      setAnalytics({
        totalViews,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        totalSubscribers: totalSubscribers || 0,
        topArticles,
        engagementRate: Math.round(engagementRate * 100) / 100
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChartIcon className="h-6 w-6" />
            Analytics & Growth
          </h2>
          <p className="text-muted-foreground">
            Track your magazine's performance and growth
          </p>
        </div>
        <Button onClick={fetchAnalyticsData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          icon={EyeIcon}
          description="Total article views"
        />
        <StatCard
          title="Total Likes"
          value={analytics.totalLikes.toLocaleString()}
          icon={HeartIcon}
          description="Total article likes"
        />
        <StatCard
          title="Comments"
          value={analytics.totalComments.toLocaleString()}
          icon={MessageCircleIcon}
          description="Total comments received"
        />
        <StatCard
          title="Subscribers"
          value={analytics.totalSubscribers.toLocaleString()}
          icon={UsersIcon}
          description="Newsletter subscribers"
        />
      </div>

      {/* Engagement Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Engagement Rate</span>
                <Badge variant="secondary">{analytics.engagementRate}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.min(analytics.engagementRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>Articles with the highest view counts</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topArticles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No articles data available
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{article.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsGrowth;