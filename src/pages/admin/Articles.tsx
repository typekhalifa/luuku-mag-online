
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { RefreshCwIcon } from "lucide-react";
import CreateArticleDialog from "@/components/articles/CreateArticleDialog";
import ArticleListRow from "@/components/articles/ArticleListRow";

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching articles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
  };

  const handleDeleteArticle = (deletedId: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== deletedId));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Articles</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? "animate-spin" : ""}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          <CreateArticleDialog onSuccess={fetchArticles} />
        </div>
      </div>

      <Table>
        <TableCaption>A list of all published articles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading articles...
              </TableCell>
            </TableRow>
          ) : articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No articles found
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <ArticleListRow
                key={article.id}
                article={article}
                onDelete={handleDeleteArticle}
              />
            ))
          )}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default Articles;
