
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChartLegend,
  ChartTooltip,
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
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import { Eye, MessageCircle, TrendingUp, Calendar } from "lucide-react";

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

  // Fetch articles with views
  let { data: articles, error: articleError } = await supabase
    .from("articles")
    .select("id, title, category, published_at, updated_at, views");
  if (articleError) {
    console.error(articleError);
    return { articles: [], counts: [], stats: { totalViews: 0, totalComments: 0, totalArticles: 0 }, categoryData: [] };
  }

  // Fetch comments in timeframe
  let { data: comments, error: commentError } = await supabase
    .from("comments")
    .select("article_id, id, posted_at");
  if (commentError) {
    console.error(commentError);
    return { articles: [], counts: [], stats: { totalViews: 0, totalComments: 0, totalArticles: 0 }, categoryData: [] };
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

  // Create rows: { id, title, category, commentCount, views }
  const data = articles.map((a) => ({
    ...a,
    commentCount: commentCounts[a.id] || 0,
  }));

  // Sort by views + comments combined
  data.sort((a, b) => (b.views + b.commentCount * 10) - (a.views + a.commentCount * 10));

  // Calculate stats
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalComments = filteredComments.length;
  const totalArticles = articles.length;

  // Category breakdown
  const categoryMap = new Map<string, { views: number; comments: number; articles: number }>();
  data.forEach(article => {
    const current = categoryMap.get(article.category) || { views: 0, comments: 0, articles: 0 };
    categoryMap.set(article.category, {
      views: current.views + (article.views || 0),
      comments: current.comments + (article.commentCount || 0),
      articles: current.articles + 1
    });
  });

  const categoryData = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    ...stats
  }));

  return { 
    articles: data, 
    counts: data, 
    stats: { totalViews, totalComments, totalArticles },
    categoryData
  };
};

// Chart components
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const BarChart = ({ data, width = 600, height = 300 }: { data: any[]; width?: number; height?: number }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ left: 5, right: 30, top: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background p-3 border rounded shadow-lg">
                  <p className="font-medium">{label}</p>
                  <p className="text-blue-600">Views: {payload[0]?.value}</p>
                  <p className="text-green-600">Comments: {payload[1]?.value}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="views" fill="#3b82f6" name="Views" />
        <Bar dataKey="commentCount" fill="#10b981" name="Comments" />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

const CategoryPieChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, articles }) => `${category} (${articles})`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="articles"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState("7");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<{ 
    articles: any[]; 
    counts: any[];
    stats: { totalViews: number; totalComments: number; totalArticles: number };
    categoryData: any[];
  }>({
    articles: [],
    counts: [],
    stats: { totalViews: 0, totalComments: 0, totalArticles: 0 },
    categoryData: []
  });

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(period)
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Article Performance Analytics</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.stats.totalViews.toLocaleString()}</div>
              <p className="text-xs opacity-80">
                {period !== "all" ? `Last ${period} days` : "All time"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.stats.totalComments.toLocaleString()}</div>
              <p className="text-xs opacity-80">
                {period !== "all" ? `Last ${period} days` : "All time"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.stats.totalArticles}</div>
              <p className="text-xs opacity-80">Published articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Articles Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={analytics.articles.slice(0, 8)} height={400} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Articles by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={analytics.categoryData} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Article Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Performance metrics {period !== "all" ? `for the last ${period} days` : "for all time"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Engagement Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.articles.slice(0, 20).map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        {article.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      {(article.views || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {article.commentCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="text-sm font-medium">
                          {Math.round((article.views || 0) + (article.commentCount * 10))}
                        </div>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
