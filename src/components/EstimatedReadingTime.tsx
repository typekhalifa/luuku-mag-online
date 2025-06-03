
import { ClockIcon } from 'lucide-react';

interface EstimatedReadingTimeProps {
  content: string;
  className?: string;
}

const EstimatedReadingTime = ({ content, className }: EstimatedReadingTimeProps) => {
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
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
