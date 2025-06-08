
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CommentReactionsProps {
  commentId: string;
  initialLikes: number;
  initialDislikes: number;
}

const CommentReactions: React.FC<CommentReactionsProps> = ({
  commentId,
  initialLikes,
  initialDislikes,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate a user identifier (in real app, use auth or session)
  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      identifier = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  };

  useEffect(() => {
    // Check if user has already reacted
    const checkUserReaction = async () => {
      const { data } = await supabase
        .from('comment_reactions')
        .select('reaction_type')
        .eq('comment_id', commentId)
        .eq('user_identifier', getUserIdentifier())
        .single();
      
      if (data) {
        setUserReaction(data.reaction_type as 'like' | 'dislike');
      }
    };

    checkUserReaction();
  }, [commentId]);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (loading) return;
    setLoading(true);

    const userIdentifier = getUserIdentifier();

    try {
      if (userReaction === type) {
        // Remove reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier);

        if (error) throw error;

        setUserReaction(null);
        if (type === 'like') setLikes(likes - 1);
        else setDislikes(dislikes - 1);
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from('comment_reactions')
          .upsert({
            comment_id: commentId,
            user_identifier: userIdentifier,
            reaction_type: type,
          });

        if (error) throw error;

        // Update counts locally
        if (userReaction === 'like' && type === 'dislike') {
          setLikes(likes - 1);
          setDislikes(dislikes + 1);
        } else if (userReaction === 'dislike' && type === 'like') {
          setDislikes(dislikes - 1);
          setLikes(likes + 1);
        } else if (type === 'like') {
          setLikes(likes + 1);
        } else {
          setDislikes(dislikes + 1);
        }

        setUserReaction(type);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userReaction === 'like' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleReaction('like')}
        disabled={loading}
        className="h-7 px-2"
      >
        <ThumbsUp size={14} />
        <span className="ml-1 text-xs">{likes}</span>
      </Button>
      <Button
        variant={userReaction === 'dislike' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleReaction('dislike')}
        disabled={loading}
        className="h-7 px-2"
      >
        <ThumbsDown size={14} />
        <span className="ml-1 text-xs">{dislikes}</span>
      </Button>
    </div>
  );
};

export default CommentReactions;
