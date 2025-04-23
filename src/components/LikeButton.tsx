
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  articleId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

// Helper: generate a session-based key so likes are unique per browser session
function getSessionLikeKey(articleId: string) {
  return `luuku_like_${articleId}`;
}

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, className, size = "default" }) => {
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  // For demo: storing a simple session flag so a visitor can like/unlike
  useEffect(() => {
    fetchLikes();
    setLiked(!!window.sessionStorage.getItem(getSessionLikeKey(articleId)));
    // Real-time update
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        if (payload.new.article_id === articleId) setLikes((prev) => prev + 1);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "likes" }, (payload) => {
        if (payload.old.article_id === articleId) setLikes((prev) => Math.max(prev - 1, 0));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [articleId]);

  // Fetch number of likes
  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("article_id", articleId);
    setLikes(count || 0);
  };

  // Track session-based like id (simulate pseudo-unique)
  const likeKey = getSessionLikeKey(articleId);

  // Find if this browser session already inserted a like for this article
  const handleLike = async () => {
    if (!liked) {
      // Add like
      const { error, data } = await supabase.from("likes").insert({
        article_id: articleId,
      }).select();
      if (!error && data && data.length > 0) {
        setLikes(likes + 1);
        setLiked(true);
        // store record id for easy unlike (not secure! but enough for demo)
        window.sessionStorage.setItem(likeKey, data[0].id);
      }
    } else {
      // Remove like
      const likeId = window.sessionStorage.getItem(likeKey);
      if (likeId) {
        const { error } = await supabase.from("likes").delete().eq("id", likeId);
        if (!error) {
          setLikes(Math.max(likes - 1, 0));
          setLiked(false);
          window.sessionStorage.removeItem(likeKey);
        }
      }
    }
  };

  return (
    <Button
      variant={liked ? "highlight" : "outline"}
      size={size}
      className={className}
      onClick={handleLike}
      aria-label={liked ? "Remove your like" : "Like this article"}
    >
      <Heart className={`${liked ? "text-red-500 fill-red-500" : ""}`} />
      {likes}
    </Button>
  );
};

export default LikeButton;
