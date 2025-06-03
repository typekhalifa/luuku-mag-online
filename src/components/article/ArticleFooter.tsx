
import React from 'react';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface ArticleFooterProps {
  articleId: string;
  author?: string | null;
}

const ArticleFooter = ({ articleId, author }: ArticleFooterProps) => {
  const handleDonate = () => {
    // You can replace this with your actual donation link or payment integration
    window.open('https://your-donation-link.com', '_blank');
  };

  return (
    <div className="px-6 pb-6">
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            {author && <span>Written by <strong>{author}</strong></span>}
          </div>
          <LikeButton articleId={articleId} />
        </div>
        <div className="mt-6">
          <CommentSection articleId={articleId} />
        </div>
        
        {/* Donate Button Section */}
        <div className="mt-8 pt-6 border-t border-dashed">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3">Support Our Magazine</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Help us continue bringing you quality journalism and stories that matter.
            </p>
            <Button 
              onClick={handleDonate}
              variant="highlight"
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Donate to Our Magazine
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleFooter;
