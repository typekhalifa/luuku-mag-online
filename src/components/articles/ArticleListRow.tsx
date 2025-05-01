
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface ArticleListRowProps {
  article: {
    id: string;
    title: string;
    category: string;
    published_at: string;
    featured: boolean;
    image_url: string | null;
    content: string;
    excerpt: string;
    author: string | null;
  };
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ArticleListRow = ({ article, onDelete, onUpdate }: ArticleListRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const publishDate = new Date(article.published_at);
  const isValidDate = !isNaN(publishDate.getTime());

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
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-normal">
          {article.category}
        </Badge>
      </TableCell>
      <TableCell>
        {isValidDate ? format(publishDate, "MMM d, yyyy") : "Invalid date"}
      </TableCell>
      <TableCell>
        {article.featured ? (
          <Badge variant="default" className="bg-highlight text-white">Featured</Badge>
        ) : (
          <Badge variant="outline">Standard</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link to={`/articles/${article.id}`} target="_blank">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview article">
              <EyeIcon className="h-4 w-4" />
            </Button>
          </Link>
          
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
