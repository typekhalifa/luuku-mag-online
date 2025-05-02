
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, Save, X, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BreakingNewsManager = () => {
  const [news, setNews] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ 
    text: "", 
    link: "#", 
    priority: 0, 
    article_id: null,
    content: "" // Added full content field
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from("breaking_news")
      .select("*")
      .order("priority", { ascending: true });

    if (error) {
      toast({
        title: "Error fetching breaking news",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNews(data || []);
    setLoading(false);
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title")
      .order("published_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching articles",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setArticles(data || []);
  };

  useEffect(() => {
    fetchNews();
    fetchArticles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the timestamp for the date field
    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from("breaking_news")
      .insert([{
        ...newItem,
        date: timestamp,
        // If an article is selected, use its URL as the link
        link: newItem.article_id ? `/articles/${newItem.article_id}` : newItem.link
      }]);

    if (error) {
      toast({
        title: "Error adding breaking news",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Breaking news added",
      description: "The breaking news item has been added successfully.",
    });

    setNewItem({ text: "", link: "#", priority: 0, article_id: null, content: "" });
    fetchNews();
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("breaking_news")
      .update({ active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    fetchNews();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("breaking_news")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting news item",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "News item deleted",
      description: "The breaking news item has been deleted successfully.",
    });

    fetchNews();
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditItem({
      text: item.text,
      link: item.link,
      priority: item.priority,
      article_id: item.article_id,
      content: item.content || ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditItem(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editItem) return;

    // If an article is selected, use its URL as the link
    const linkToUse = editItem.article_id ? `/articles/${editItem.article_id}` : editItem.link;

    const { error } = await supabase
      .from("breaking_news")
      .update({
        text: editItem.text,
        link: linkToUse,
        priority: editItem.priority,
        article_id: editItem.article_id,
        content: editItem.content
      })
      .eq("id", editingId);

    if (error) {
      toast({
        title: "Error updating news item",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "News item updated",
      description: "The breaking news item has been updated successfully.",
    });

    setEditingId(null);
    setEditItem(null);
    fetchNews();
  };

  const handleArticleChange = (articleId: string | null) => {
    if (articleId === "none") {
      // If "No linked article" is selected
      if (editingId) {
        setEditItem({
          ...editItem,
          article_id: null,
          link: "#"
        });
      } else {
        setNewItem({
          ...newItem,
          article_id: null,
          link: "#"
        });
      }
    } else if (articleId) {
      // If a specific article is selected
      if (editingId) {
        setEditItem({
          ...editItem,
          article_id: articleId,
          link: `/articles/${articleId}`
        });
      } else {
        setNewItem({
          ...newItem,
          article_id: articleId,
          link: `/articles/${articleId}`
        });
      }
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="News text"
            value={newItem.text}
            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
            required
          />
          <div className="flex gap-2 items-center">
            <Select 
              value={newItem.article_id || "none"} 
              onValueChange={(value) => handleArticleChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to article (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked article</SelectItem>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Priority"
              value={newItem.priority}
              onChange={(e) =>
                setNewItem({ ...newItem, priority: parseInt(e.target.value) || 0 })
              }
              className="w-1/2"
            />
            <Input
              placeholder="Custom link (if no article)"
              value={newItem.link}
              onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
              disabled={!!newItem.article_id}
              className="w-1/2"
            />
          </div>
        </div>
        
        <Textarea
          placeholder="Full news content (optional)"
          value={newItem.content}
          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
          className="min-h-[100px]"
        />
        
        <Button type="submit">Add Breaking News</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Text</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : news.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No breaking news items found
              </TableCell>
            </TableRow>
          ) : (
            news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      value={editItem?.text}
                      onChange={(e) => setEditItem({ ...editItem, text: e.target.value })}
                    />
                  ) : (
                    item.text
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-2">
                      <Select 
                        value={editItem?.article_id || "none"} 
                        onValueChange={(value) => handleArticleChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link to article" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No linked article</SelectItem>
                          {articles.map((article) => (
                            <SelectItem key={article.id} value={article.id}>
                              {article.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Custom link"
                        value={editItem?.link}
                        onChange={(e) => setEditItem({ ...editItem, link: e.target.value })}
                        disabled={!!editItem?.article_id}
                      />
                    </div>
                  ) : (
                    <a 
                      href={item.link} 
                      className="text-blue-500 hover:underline truncate block max-w-[200px]"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {item.link}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      value={editItem?.priority}
                      onChange={(e) => setEditItem({ ...editItem, priority: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    item.priority
                  )}
                </TableCell>
                <TableCell>{item.active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  {item.date ? formatRelativeTime(item.date) : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === item.id ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={saveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(item.id, item.active)}
                      >
                        {item.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewingItem(item)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEditing(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialog to view full news content */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingItem?.text}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="text-sm text-muted-foreground">
              {viewingItem?.date ? formatRelativeTime(viewingItem.date) : "N/A"}
            </div>
            {viewingItem?.content ? (
              <div className="prose max-w-none">
                {viewingItem.content}
              </div>
            ) : (
              <div className="italic text-muted-foreground">No detailed content available</div>
            )}
            {viewingItem?.article_id && (
              <div className="pt-4">
                <Button asChild variant="outline">
                  <a href={`/articles/${viewingItem.article_id}`} target="_blank" rel="noopener noreferrer">
                    View linked article
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreakingNewsManager;
