
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Reply } from "lucide-react";
import CommentReactions from "./CommentReactions";
import CommentReportDialog from "./CommentReportDialog";

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  posted_at: string;
  status: string | null;
  parent_comment_id: string | null;
  likes_count: number | null;
  dislikes_count: number | null;
  replies?: Comment[];
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .or("status.eq.approved,status.is.null") // Only show approved comments
      .order("posted_at", { ascending: false });
    
    if (!error && data) {
      // Organize comments into threads
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];
      
      // First pass: create map of all comments
      data.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });
      
      // Second pass: organize into tree structure
      data.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      });
      
      setComments(rootComments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    // Listen for real-time new comments
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) => {
        if (payload.new.article_id === articleId && (payload.new.status === 'approved' || !payload.new.status)) {
          fetchComments(); // Refresh to maintain thread structure
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      author_name: author || null,
      content,
      parent_comment_id: null,
    });
    
    if (!error) {
      setContent("");
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      author_name: author || null,
      content: replyContent,
      parent_comment_id: parentId,
    });
    
    if (!error) {
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : ''} border-b pb-3 last:border-b-0`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-sm font-semibold text-muted-foreground">
            {comment.author_name || "Anonymous"}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(comment.posted_at).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="text-sm mb-2">{comment.content}</div>
      
      <div className="flex items-center gap-2">
        <CommentReactions
          commentId={comment.id}
          initialLikes={comment.likes_count || 0}
          initialDislikes={comment.dislikes_count || 0}
        />
        
        {depth < 2 && ( // Limit reply depth
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            <Reply size={12} />
            <span className="ml-1">Reply</span>
          </Button>
        )}
        
        <CommentReportDialog commentId={comment.id} />
      </div>
      
      {replyingTo === comment.id && (
        <div className="mt-3 ml-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 min-h-[60px]"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button 
                size="sm" 
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <h4 className="text-base font-semibold flex items-center gap-1 mb-4">
        <MessageCircle size={18} />
        Comments ({comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <Input
          placeholder="Name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full sm:w-1/3"
        />
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[80px]"
          rows={3}
        />
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>
      
      <div className="space-y-4 max-h-96 overflow-y-auto rounded bg-muted/30 p-4">
        {loading && <div className="text-sm text-muted-foreground">Loading comments...</div>}
        {!loading && comments.length === 0 && (
          <div className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</div>
        )}
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default CommentSection;
