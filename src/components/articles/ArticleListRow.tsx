
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, EyeIcon, ClockIcon, StarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import EditArticleDialog from "./EditArticleDialog";
import ArticleScheduler from "./ArticleScheduler";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArticleListRowProps {
  article: {
    id: string;
    title: string;
    category: string;
    published_at: string;
    featured: boolean;
    our_pick: boolean;
    image_url: string | null;
    content: string;
    excerpt: string;
    author: string | null;
    views: number;
  };
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ArticleListRow = ({ article, onDelete, onUpdate }: ArticleListRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Parse the date safely
  const publishDate = new Date(article.published_at);
  const isValidDate = !isNaN(publishDate.getTime());
  
  // Format date relative to now for display
  const getFormattedDate = () => {
    if (!isValidDate) return "Invalid date";
    
    if (isToday(publishDate)) {
      return `Today, ${format(publishDate, "h:mm a")}`;
    } else if (isYesterday(publishDate)) {
      return `Yesterday, ${format(publishDate, "h:mm a")}`;
    } else if (new Date().getFullYear() === publishDate.getFullYear()) {
      return format(publishDate, "MMM d, h:mm a");
    } else {
      return format(publishDate, "MMM d, yyyy");
    }
  };
  
  // Get relative time for tooltip
  const getRelativeTime = () => {
    if (!isValidDate) return "";
    return formatDistanceToNow(publishDate, { addSuffix: true });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);

      if (error) throw error;
      
      onDelete(article.id);
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting article",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow key={article.id}>
      <TableCell className="w-[250px]">
        <div className="flex items-center gap-3">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-16 w-16 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{article.title}</div>
            <div className="text-sm text-muted-foreground truncate">
              By {article.author || "Admin"}
            </div>
            <div className="text-xs flex items-center text-muted-foreground mt-1">
              <EyeIcon className="h-3 w-3 mr-1" />
              {article.views || 0} views
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-normal">
          {article.category}
        </Badge>
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-muted-foreground" />
                <span>{getFormattedDate()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div>Published {getRelativeTime()}</div>
                <div className="text-muted-foreground">
                  {isValidDate ? format(publishDate, "PPPp") : "Invalid date"}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {article.featured && (
            <Badge variant="success" className="font-normal">Featured</Badge>
          )}
          {article.our_pick && (
            <Badge variant="outline" className="font-normal bg-amber-50 border-amber-300">
              <StarIcon className="h-3 w-3 mr-1 text-amber-500" />
              Our Pick
            </Badge>
          )}
          {!article.featured && !article.our_pick && (
            <Badge variant="outline">Standard</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/articles/${article.id}`} target="_blank">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View article</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ArticleScheduler 
            articleId={article.id}
            currentPublishedAt={article.published_at}
            onScheduled={onUpdate}
          />
          
          <EditArticleDialog 
            article={article} 
            onSuccess={onUpdate}
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this article? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ArticleListRow;
