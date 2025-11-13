
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, BadgeIcon, EyeIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EstimatedReadingTime from '@/components/EstimatedReadingTime';
import SocialShare from '@/components/SocialShare';

interface ArticleHeaderProps {
  title: string;
  category: string;
  featured?: boolean | null;
  publishedAt: string;
  viewCount: number;
  content?: string | null;
  excerpt?: string | null;
  imageUrl?: string | null;
}

const ArticleHeader = ({
  title,
  category,
  featured,
  publishedAt,
  viewCount,
  content,
  excerpt,
  imageUrl
}: ArticleHeaderProps) => {
  const publishDate = new Date(publishedAt);
  const isValidPublishDate = !isNaN(publishDate.getTime());
  
  const relativeDate = isValidPublishDate
    ? formatDistanceToNow(publishDate, { addSuffix: true })
    : "Unknown time ago";

  const currentUrl = window.location.href;

  return (
    <>
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <Badge className="bg-highlight text-white">
              {category}
            </Badge>
            {featured && (
              <Badge variant="success" className="flex gap-1 items-center">
                <BadgeIcon className="h-3 w-3" />
                <span>Featured</span>
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>Published {relativeDate}</span>
            </div>
            <span className="mx-1">•</span>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
            {content && (
              <>
                <span className="mx-1">•</span>
                <EstimatedReadingTime content={content} />
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <SocialShare title={title} url={currentUrl} />
          </div>
        </div>
        
        {excerpt && (
          <p className="text-lg font-medium text-gray-600 mb-6 border-l-4 border-highlight pl-4 italic">
            {excerpt}
          </p>
        )}
      </div>
    </>
  );
};

export default ArticleHeader;
