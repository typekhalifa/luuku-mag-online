
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  articleId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";  // added optional size prop matching Button's variant sizes
}

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, className, size = "default" }) => {
  const [likes, setLikes] = useState<number>(0);
  const [clicked, setClicked] = useState<boolean>(false);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("article_id", articleId);
    setLikes(count || 0);
  };

  useEffect(() => {
    fetchLikes();
    // Listen for real-time like additions
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (payload) => {
        if (payload.new.article_id === articleId) {
          setLikes((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId]);

  const handleLike = async () => {
    if (clicked) return; // prevent multiple likes in same session
    setClicked(true);
    await supabase.from("likes").insert({
      article_id: articleId,
    });
    // Optimistically update UI
    setLikes((prev) => prev + 1);
  };

  return (
    <Button
      variant={clicked ? "highlight" : "outline"}
      size={size}
      className={className}
      onClick={handleLike}
      disabled={clicked}
      aria-label="Like this article"
    >
      <Heart className={`${clicked ? "text-red-500 fill-red-500" : ""}`} />
      {likes}
    </Button>
  );
};

export default LikeButton;

