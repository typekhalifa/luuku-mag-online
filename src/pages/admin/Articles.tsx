
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
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import CreateArticleDialog from "@/components/articles/CreateArticleDialog";
import ArticleListRow from "@/components/articles/ArticleListRow";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "All",
  "World",
  "Politics",
  "Technology",
  "Sports",
  "Finance",
  "Health",
  "Entertainment",
  "Education",
  "Opportunities"
];

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);

  const fetchArticles = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all articles without any filters
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      
      // Handle nullable fields - ensure our_pick and views have default values
      const processedData = data?.map(article => ({
        ...article,
        our_pick: article.our_pick || false,
        views: article.views || 0
      })) || [];
      
      setArticles(processedData);
      
      // Apply current filters
      applyFilters(processedData);
      
      console.log("Fetched articles:", processedData.length);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
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

  useEffect(() => {
    fetchArticles();
  }, []);

  const applyFilters = (articlesToFilter = articles) => {
    let result = [...articlesToFilter];
    
    // Apply category filter
    if (categoryFilter !== "All") {
      result = result.filter(article => article.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(article => 
        article.title?.toLowerCase().includes(term) || 
        (article.excerpt && article.excerpt.toLowerCase().includes(term)) ||
        (article.author && article.author.toLowerCase().includes(term))
      );
    }
    
    setFilteredArticles(result);
  };
  
  // Apply filters when filters or articles change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, articles]);

  const handleRefresh = async () => {
    await fetchArticles();
  };

  const handleDeleteArticle = (deletedId: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== deletedId));
  };

  const renderTableSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

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

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>
          {filteredArticles.length === 0 && !loading
            ? "No articles found matching your criteria"
            : "Manage your published articles"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            renderTableSkeleton()
          ) : filteredArticles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <p className="mb-2">No articles found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredArticles.map((article) => (
              <ArticleListRow
                key={article.id}
                article={article}
                onDelete={handleDeleteArticle}
                onUpdate={fetchArticles}
              />
            ))
          )}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default Articles;
