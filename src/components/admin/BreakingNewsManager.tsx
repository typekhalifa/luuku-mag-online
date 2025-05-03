
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
import { Trash2, Edit, Save, X, FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
    content: "", 
    date: new Date().toISOString() // Set current date/time by default
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
        date: newItem.date || timestamp,
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

    setNewItem({ 
      text: "", 
      link: "#", 
      priority: 0, 
      article_id: null, 
      content: "", 
      date: new Date().toISOString() 
    });
    
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
      content: item.content || "",
      date: item.date || new Date().toISOString()
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
        content: editItem.content,
        date: editItem.date || new Date().toISOString() // Use the edited date or current time
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
      return dateString || "N/A";
    }
  };

  const viewNewsPublicPage = (item: any) => {
    // Open the news item public page in a new tab
    window.open(`/breaking-news/${item.id}`, '_blank');
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
              className="w-1/3"
            />
            <Input
              placeholder="Custom link (if no article)"
              value={newItem.link}
              onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
              disabled={!!newItem.article_id}
              className="w-2/3"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            value={newItem.date ? new Date(newItem.date).toISOString().slice(0, 16) : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setNewItem({ ...newItem, date: new Date(value).toISOString() });
              } else {
                setNewItem({ ...newItem, date: new Date().toISOString() });
              }
            }}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground pt-2">
            Will display as: {newItem.date ? formatRelativeTime(newItem.date) : "N/A"}
          </div>
        </div>
        
        <Textarea
          placeholder="Full news content (optional)"
          value={newItem.content}
          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
          className="min-h-[150px]"
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
            <TableHead>Time</TableHead>
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
                  {editingId === item.id ? (
                    <Input
                      type="datetime-local"
                      value={editItem?.date ? new Date(editItem.date).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          setEditItem({ ...editItem, date: new Date(value).toISOString() });
                        } else {
                          setEditItem({ ...editItem, date: new Date().toISOString() });
                        }
                      }}
                    />
                  ) : (
                    <span title={item.date}>
                      {item.date ? formatRelativeTime(item.date) : "N/A"}
                    </span>
                  )}
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
            <DialogDescription>
              {viewingItem?.date ? formatRelativeTime(viewingItem.date) : "N/A"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {viewingItem?.content ? (
              <div className="prose max-w-none">
                {viewingItem.content}
              </div>
            ) : (
              <div className="italic text-muted-foreground">No detailed content available</div>
            )}
            
            <div className="pt-4">
              {viewingItem?.article_id && (
                <Button asChild variant="outline" className="mr-2">
                  <a href={`/articles/${viewingItem.article_id}`} target="_blank" rel="noopener noreferrer">
                    View linked article
                  </a>
                </Button>
              )}
              
              <Button variant="outline">
                <a href={`/breaking-news/${viewingItem?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  View public page <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreakingNewsManager;
