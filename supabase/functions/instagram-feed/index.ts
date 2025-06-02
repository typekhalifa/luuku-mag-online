
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    
    if (!instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    // Fetch Instagram posts using Instagram Basic Display API
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&access_token=${instagramAccessToken}&limit=12`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for images and videos, format the response
    const formattedPosts = data.data
      .filter((post: any) => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM')
      .map((post: any) => ({
        id: post.id,
        imageUrl: post.media_url,
        permalink: post.permalink,
        caption: post.caption || '',
      }));

    return new Response(
      JSON.stringify({ posts: formattedPosts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    
    // Return fallback posts in case of error
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

    return new Response(
      JSON.stringify({ posts: fallbackPosts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
