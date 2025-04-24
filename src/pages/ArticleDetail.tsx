
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        return;
      }

      setArticle(data);
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Loading article...</div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Article not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Card className="overflow-hidden">
          {article.image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="mb-4">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-highlight text-white rounded">
                {article.category}
              </span>
              <h1 className="text-3xl font-bold mt-2">{article.title}</h1>
              <p className="text-sm text-gray-500 mt-2">
                Published on {new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
            
            {article.excerpt && (
              <p className="text-lg font-medium text-gray-600 mb-6">
                {article.excerpt}
              </p>
            )}
            
            <div className="prose max-w-none">
              {article.content}
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-4">
                <LikeButton articleId={article.id} />
              </div>
              <div className="mt-6">
                <CommentSection articleId={article.id} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ArticleDetail;
