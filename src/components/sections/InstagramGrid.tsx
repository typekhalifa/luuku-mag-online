
import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";

const InstagramGrid = () => {
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, we'll use placeholder images that represent the type of content luukumag1 might post
  // In a real implementation, you'd need Instagram Basic Display API or Instagram Graph API
  const fallbackPosts = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=500&fit=crop",
  ];

  useEffect(() => {
    // Simulate loading Instagram posts
    // In real implementation, you would:
    // 1. Get Instagram Access Token
    // 2. Fetch posts from Instagram API
    // 3. Extract image URLs
    const loadInstagramPosts = async () => {
      try {
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, use fallback posts
        // TODO: Replace with actual Instagram API integration
        setPosts(fallbackPosts);
      } catch (error) {
        console.error("Error loading Instagram posts:", error);
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
          {posts.map((image, index) => (
            <a 
              key={index} 
              href="https://instagram.com/luukumag1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden"
            >
              <img 
                src={image} 
                alt={`Instagram post ${index + 1} from @luukumag1`}
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
