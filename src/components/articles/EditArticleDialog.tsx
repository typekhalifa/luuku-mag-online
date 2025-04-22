
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface EditArticleDialogProps {
  article: {
    id: string;
    title: string;
    category: string;
    content: string;
    excerpt: string;
    featured: boolean;
    image_url: string | null;
  };
  onSuccess: () => void;
}

interface FormData {
  title: string;
  category: string;
  content: string;
  excerpt: string;
  featured: boolean;
}

export default function EditArticleDialog({ article, onSuccess }: EditArticleDialogProps) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: article.title,
      category: article.category,
      content: article.content || '',
      excerpt: article.excerpt || '',
      featured: article.featured || false,
    },
  });
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: data.title,
          category: data.category,
          content: data.content,
          excerpt: data.excerpt,
          featured: data.featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article updated successfully",
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              {...register("category")}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              {...register("excerpt")}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              {...register("content")}
              className="w-full p-2 border rounded-md"
              rows={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("featured")}
              id="featured"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured Article
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
