
import React from 'react';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';

interface ArticleFooterProps {
  articleId: string;
  author?: string | null;
}

const ArticleFooter = ({ articleId, author }: ArticleFooterProps) => {
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
      </div>
    </div>
  );
};

export default ArticleFooter;
