
import { ClockIcon } from 'lucide-react';

interface EstimatedReadingTimeProps {
  content: string;
  className?: string;
}

const EstimatedReadingTime = ({ content, className }: EstimatedReadingTimeProps) => {
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200; // Average reading speed
    
    // Remove HTML tags and extra whitespace for more accurate word count
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ').filter(word => word.length > 0).length;
    
    // Calculate minutes and ensure minimum of 1 minute
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return minutes;
  };

  const readingTime = calculateReadingTime(content);

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <ClockIcon className="h-4 w-4" />
      <span>{readingTime} min read</span>
    </div>
  );
};

export default EstimatedReadingTime;
