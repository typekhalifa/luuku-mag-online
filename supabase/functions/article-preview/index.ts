import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response('Article ID required', { status: 400 });
    }

    // Check if it's a bot/crawler
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    
    const botPatterns = [
      'facebookexternalhit', 'facebot', 'facebook', 
      'twitterbot', 'twitter',
      'linkedinbot', 'linkedin',
      'whatsapp', 'whatsappbot',
      'bot', 'crawler', 'spider'
    ];
    
    const isCrawler = botPatterns.some(pattern => userAgent.includes(pattern));
    
    console.log(`Request from: ${userAgent.substring(0, 100)}`);
    console.log(`Is Crawler: ${isCrawler}`);
    
    // If not a crawler, serve a simple HTML that tells them to use the main site
    if (!isCrawler) {
      const simpleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=https://www.luukumag.com/articles/${id}">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to article... <a href="https://www.luukumag.com/articles/${id}">Click here if not redirected</a></p>
  <script>window.location.href = 'https://www.luukumag.com/articles/${id}';</script>
</body>
</html>`;
      return new Response(simpleHTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // Check if ID is UUID or slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    let query = supabase.from('articles').select('*');
    
    if (uuidRegex.test(id)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }
    
    const { data: article, error } = await query.maybeSingle();
    
    if (error || !article) {
      console.error('Article fetch error:', error);
      return new Response(getNotFoundHTML(), { 
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    const articleUrl = `https://www.luukumag.com/articles/${article.slug || article.id}`;
    
    // Ensure image URL is absolute with www and proper extension
    let articleImage = article.image_url;
    
    if (!articleImage || articleImage.trim() === '') {
      articleImage = 'https://www.luukumag.com/lovable-uploads/logo.png';
    } else if (!articleImage.startsWith('http')) {
      // Relative URL - make it absolute
      articleImage = `https://www.luukumag.com${articleImage.startsWith('/') ? '' : '/'}${articleImage}`;
    } else {
      // Already absolute - ensure www
      articleImage = articleImage.replace('://luukumag.com/', '://www.luukumag.com/');
    }
    
    console.log('Article URL:', articleUrl);
    console.log('Article Image from DB:', article.image_url);
    console.log('Final Article Image:', articleImage);
    
    // Determine image type
    const imageExtension = articleImage.split('.').pop()?.toLowerCase() || 'jpeg';
    const imageType = imageExtension === 'png' ? 'image/png' : 'image/jpeg';
    
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    const articleTitle = escapeHtml(article.title);
    const cleanExcerpt = article.excerpt 
      ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 160)
      : article.title;
    const articleDescription = escapeHtml(cleanExcerpt);
    const articleAuthor = escapeHtml(article.author || 'LUUKU MAG Editorial Team');
    
    const html = generateArticleHTML({
      title: articleTitle,
      description: articleDescription,
      url: articleUrl,
      image: articleImage,
      imageType: imageType,
      author: articleAuthor,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      category: article.category,
    });
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(getErrorHTML(), { 
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

function generateArticleHTML(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  imageType: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.title} - LUUKU MAG</title>
    <meta name="description" content="${data.description}" />
    <link rel="canonical" href="${data.url}" />
    
    <!-- Essential OpenGraph tags -->
    <meta property="fb:app_id" content="1234567890" />
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${data.url}" />
    <meta property="og:image" content="${data.image}" />
    <meta property="og:image:secure_url" content="${data.image}" />
    <meta property="og:image:type" content="${data.imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${data.title}" />
    <meta property="og:site_name" content="LUUKU MAG" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@luukumag" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    <meta name="twitter:image" content="${data.image}" />
    
    <!-- Redirect to actual article -->
    <meta http-equiv="refresh" content="0;url=${data.url}" />
    <script>window.location.href="${data.url}";</script>
  </head>
  <body>
    <h1>${data.title}</h1>
    <p>Redirecting to article...</p>
    <a href="${data.url}">Click here if not redirected</a>
  </body>
</html>`;
}

function getNotFoundHTML(): string {
  return `<!DOCTYPE html><html><head><title>404</title></head><body><h1>Article Not Found</h1></body></html>`;
}

function getErrorHTML(): string {
  return `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error Loading Article</h1></body></html>`;
}
