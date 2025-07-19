
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableCaption,
} from "@/components/ui/table";
import {
  ChartContainer,
} from "@/components/ui/chart";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Eye, MessageCircle, TrendingUp, Users } from "lucide-react";

const PERIODS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "All Time", value: "all" },
];

function getFromDate(period: string): string | null {
  if (period === "all") return null;
  const days = parseInt(period, 10);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const fetchAnalytics = async (period: string) => {
  const fromDate = getFromDate(period);

  // Fetch articles
  let { data: articles, error: articleError } = await supabase
    .from("articles")
    .select("id, title, category, published_at, updated_at, views");
  if (articleError) {
    console.error(articleError);
    return { articles: [], counts: [] };
  }

  // Fetch comments in timeframe
  let { data: comments, error: commentError } = await supabase
    .from("comments")
    .select("article_id, id, posted_at");
  if (commentError) {
    console.error(commentError);
    return { articles: [], counts: [] };
  }

  // Filter comments by date
  const filteredComments =
    fromDate != null
      ? comments.filter((c) => c.posted_at && c.posted_at >= fromDate)
      : comments;

  // Count comments per article
  const commentCounts: Record<string, number> = {};
  for (const c of filteredComments) {
    if (!c.article_id) continue;
    commentCounts[c.article_id] = (commentCounts[c.article_id] || 0) + 1;
  }

  // Create rows: { id, title, category, commentCount }
  const data = articles.map((a) => ({
    ...a,
    commentCount: commentCounts[a.id] || 0,
  }));

  // Sort by comment count desc
  data.sort((a, b) => b.commentCount - a.commentCount);

  return { articles: data, counts: data };
};

// BarChart component definition
const BarChart = ({ data, width = 600, height = 260 }: { data: any[]; width?: number; height?: number }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} layout="vertical" margin={{ left: 40, right: 16, top: 8, bottom: 8 }}>
        <XAxis type="number" />
        <YAxis dataKey="title" type="category" width={120} />
        <Bar dataKey="commentCount" fill="#3b82f6" radius={[8, 8, 8, 8]} />
        <Tooltip />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState("7");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<{ articles: any[]; counts: any[] }>({
    articles: [],
    counts: [],
  });
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalComments: 0,
    totalViews: 0,
    avgCommentsPerArticle: 0
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f'];

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(period)
      .then((data) => {
        setAnalytics(data);
        
        // Calculate stats
        const totalArticles = data.articles.length;
        const totalComments = data.articles.reduce((sum, a) => sum + a.commentCount, 0);
        const totalViews = data.articles.reduce((sum, a) => sum + (a.views || 0), 0);
        const avgComments = totalArticles > 0 ? Math.round(totalComments / totalArticles * 10) / 10 : 0;
        
        setStats({
          totalArticles,
          totalComments,
          totalViews,
          avgCommentsPerArticle: avgComments
        });

        // Prepare category data
        const categoryStats: Record<string, number> = {};
        data.articles.forEach(article => {
          categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
        });
        
        const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
          name,
          value
        }));
        setCategoryData(categoryChartData);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your content performance and engagement</p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">Time Period:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Article readership</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Comments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCommentsPerArticle}</div>
            <p className="text-xs text-muted-foreground">Per article</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Articles by Comments</CardTitle>
            <CardDescription>Most engaging content by comment count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                comments: {
                  label: "Comments",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <BarChart data={analytics.articles.slice(0, 8)} />
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Category</CardTitle>
            <CardDescription>Distribution of articles across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                category: {
                  label: "Articles",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
          <CardDescription>
            Comprehensive view of all articles {period !== "all" ? `in the last ${period} days` : "all time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading analytics...</TableCell>
                </TableRow>
              ) : analytics.articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No articles found for selected period</TableCell>
                </TableRow>
              ) : (
                analytics.articles.map((article) => {
                  const engagement = article.views > 0 ? Math.round((article.commentCount / article.views) * 100 * 10) / 10 : 0;
                  return (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="font-medium">{article.title}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {article.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Draft"}
                      </TableCell>
                      <TableCell>{article.views || 0}</TableCell>
                      <TableCell>{article.commentCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(engagement * 5, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{engagement}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
