
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const BreakingNewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articleDetails, setArticleDetails] = useState<any>(null);
  const [fetchingArticle, setFetchingArticle] = useState(false);

  useEffect(() => {
    const fetchNewsItem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching breaking news:", error);
        setLoading(false);
        return;
      }

      setNewsItem(data);
      
      // If there's an associated article, fetch its details
      if (data.article_id) {
        setFetchingArticle(true);
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", data.article_id)
          .single();
        
        if (!articleError) {
          setArticleDetails(articleData);
        } else {
          console.error("Error fetching article details:", articleError);
        }
        setFetchingArticle(false);
      }
      
      setLoading(false);
    };

    if (id) {
      fetchNewsItem();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      // Check if the date is already in a relative format (contains "ago")
      if (typeof dateString === 'string' && dateString.includes("ago")) {
        return dateString;
      }
      // Format the date as "X time ago" (e.g. "1 hour ago", "5 minutes ago")
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString || "";
    }
  };

  // Function to format content with proper paragraphs
  const formatContent = (content: string) => {
    if (!content) return [];
    
    // Split by double line breaks for paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    // Handle single line breaks within paragraphs
    return paragraphs.map(paragraph => {
      // Replace single line breaks with <br> tags
      return paragraph.split(/\n/).join("<br />");
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center">
            <div className="animate-pulse w-full max-w-3xl">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!newsItem) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Breaking News Not Found</h1>
            <p>The news item you're looking for doesn't exist or has been removed.</p>
            <Button variant="outline" className="mt-6" asChild>
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 text-sm text-muted-foreground">
            {newsItem.date ? formatDate(newsItem.date) : ""}
          </div>
          <h1 className="text-3xl font-bold mb-6">{newsItem.text}</h1>
          
          {newsItem.content ? (
            <div className="prose max-w-none my-8 space-y-6">
              {formatContent(newsItem.content).map((paragraph, i) => (
                <div 
                  key={i} 
                  className="text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          ) : (
            <div className="my-8 text-muted-foreground italic">
              No additional details available for this breaking news.
            </div>
          )}
          
          {articleDetails && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Related Article</h2>
              <div className="border rounded-md p-4 hover:bg-gray-50">
                <h3 className="font-medium">{articleDetails.title}</h3>
                {articleDetails.excerpt && (
                  <p className="mt-2 text-sm text-gray-600">{articleDetails.excerpt}</p>
                )}
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a href={`/articles/${articleDetails.id}`} className="inline-flex items-center">
                    Read full article <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
          
          {!newsItem.article_id && newsItem.link && newsItem.link !== "#" && (
            <div className="mt-8">
              <Button variant="outline" asChild>
                <a 
                  href={newsItem.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  More Information <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BreakingNewsDetail;
