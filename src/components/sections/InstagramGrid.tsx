
import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption: string;
}

const InstagramGrid = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstagramPosts = async () => {
      try {
        console.log("Fetching Instagram posts...");
        
        // Call our edge function to get Instagram posts
        const { data, error } = await supabase.functions.invoke('instagram-feed');
        
        if (error) {
          console.error("Error calling Instagram function:", error);
          throw error;
        }

        if (data && data.posts) {
          setPosts(data.posts);
          console.log("Successfully loaded Instagram posts:", data.posts.length);
        }
      } catch (error) {
        console.error("Error loading Instagram posts:", error);
        
        // Fallback posts in case of error
        const fallbackPosts = [
          {
            id: 'fallback-1',
            imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Tech innovation content"
          },
          {
            id: 'fallback-2',
            imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Programming insights"
          },
          {
            id: 'fallback-3',
            imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Technology updates"
          },
          {
            id: 'fallback-4',
            imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Coding tutorials"
          },
          {
            id: 'fallback-5',
            imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Development tips"
          },
          {
            id: 'fallback-6',
            imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=500&fit=crop",
            permalink: "https://instagram.com/luukumag1",
            caption: "Tech news"
          }
        ];
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };

    loadInstagramPosts();
  }, []);

  if (loading) {
    return (
      <div className="bg-black pt-10">
        <div className="container px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Instagram size={24} className="text-highlight" />
            <h3 className="text-xl font-bold font-heading">Follow Us on Instagram</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index}
                className="aspect-square bg-gray-800 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black pt-10">
      <div className="container px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Instagram size={24} className="text-highlight" />
          <h3 className="text-xl font-bold font-heading">Follow Us on Instagram</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {posts.slice(0, 6).map((post) => (
            <a 
              key={post.id} 
              href={post.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden"
            >
              <img 
                src={post.imageUrl} 
                alt={post.caption || `Instagram post from @luukumag1`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                <Instagram size={24} className="text-white" />
              </div>
            </a>
          ))}
        </div>
        
        <div className="text-center mt-6 pb-10">
          <a
            href="https://instagram.com/luukumag1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-highlight text-white px-6 py-3 rounded-lg hover:bg-highlight/90 transition-colors"
          >
            <Instagram size={20} />
            Follow @luukumag1
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramGrid;
