
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const BreakingNewsManager = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ text: "", link: "#", priority: 0 });

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

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("breaking_news").insert([newItem]);

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

    setNewItem({ text: "", link: "#", priority: 0 });
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
          <Input
            placeholder="Link (optional)"
            value={newItem.link}
            onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Priority"
            value={newItem.priority}
            onChange={(e) =>
              setNewItem({ ...newItem, priority: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <Button type="submit">Add Breaking News</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Text</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : news.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No breaking news items found
              </TableCell>
            </TableRow>
          ) : (
            news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.text}</TableCell>
                <TableCell>{item.link}</TableCell>
                <TableCell>{item.priority}</TableCell>
                <TableCell>{item.active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(item.id, item.active)}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BreakingNewsManager;
