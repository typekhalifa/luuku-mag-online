
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

interface ArticleListRowProps {
  article: {
    id: string;
    title: string;
    category: string;
    author: string | null;
    published_at: string;
    featured: boolean;
    image_url: string | null;
  };
  onDelete: (id: string) => void;
}

const ArticleListRow = ({ article, onDelete }: ArticleListRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

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
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-12 w-12 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium">{article.title}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[180px]">
              {article.author || "Anonymous"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary">
          {article.category}
        </span>
      </TableCell>
      <TableCell>{new Date(article.published_at).toLocaleDateString()}</TableCell>
      <TableCell>{article.featured ? "Yes" : "No"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
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
