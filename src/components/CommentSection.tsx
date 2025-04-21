
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  posted_at: string;
}

interface CommentSectionProps {
  articleId: string;
  className?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId, className }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("posted_at", { ascending: false });
    if (!error && data) setComments(data as Comment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    // Listen for real-time new comments
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) => {
        if (payload.new.article_id === articleId) {
          setComments((prev) => [payload.new as Comment, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      article_id: articleId,
      author_name: author || null,
      content,
    });
    setContent("");
    setSubmitting(false);
    // The realtime event will update comments list, but fetch just in case
    fetchComments();
  };

  return (
    <div className={className}>
      <h4 className="text-base font-semibold flex items-center gap-1 mb-2">
        <MessageCircle size={18} />
        Comments ({comments.length})
      </h4>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <Input
          placeholder="Name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-1/4"
        />
        <Input
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          Post
        </Button>
      </form>
      <div className="space-y-2 max-h-56 overflow-y-auto rounded bg-muted/30 p-2">
        {loading && <div className="text-xs text-muted-foreground">Loading...</div>}
        {!loading && comments.length === 0 && (
          <div className="text-xs text-muted-foreground">No comments yet.</div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-1 last:border-b-0">
            <span className="text-xs font-semibold text-muted-foreground">{c.author_name || "Anonymous"}</span>{" "}
            <span className="text-xs text-gray-400">{new Date(c.posted_at).toLocaleString()}</span>
            <div className="text-sm">{c.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
