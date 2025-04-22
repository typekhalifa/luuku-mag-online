
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
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
} from "recharts";

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
    .select("id, title, category, published_at, updated_at");
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

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(period)
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Article Performance Analytics</h1>
      <div className="flex gap-2 mb-6">
        <label htmlFor="period" className="font-medium">
          Period:
        </label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded px-2 py-1 bg-background"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8 w-full max-w-2xl">
        <ChartContainer
          config={{
            comments: {
              label: "Comments",
              color: "#3b82f6",
            },
          }}
        >
          <BarChart data={analytics.articles.slice(0, 10)} />
        </ChartContainer>
      </div>
      <Table>
        <TableCaption>
          Top articles by comments {period !== "all" ? `in the last ${period} days` : "all time"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>Loading...</TableCell>
            </TableRow>
          ) : analytics.articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No articles found.</TableCell>
            </TableRow>
          ) : (
            analytics.articles.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>
                  {a.published_at
                    ? new Date(a.published_at).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell>{a.commentCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default Analytics;
