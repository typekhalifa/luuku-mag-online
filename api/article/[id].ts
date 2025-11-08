import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  
  // Check if it's a bot/crawler
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /bot|crawler|spider|crawling|facebook|twitter|linkedinbot|whatsapp|telegram/i.test(userAgent);
  
  // If not a crawler, redirect to the SPA
  if (!isCrawler) {
    return res.redirect(307, `/article/${id}`);
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
      return res.status(404).send('Article not found');
    }
    
    const articleUrl = `https://luukumag.com/article/${article.slug || article.id}`;
    const articleImage = article.image_url || 'https://luukumag.com/lovable-uploads/logo.png';
    const articleTitle = article.title;
    const articleDescription = article.excerpt || article.title;
    const articleAuthor = article.author || 'LUUKU MAG Editorial Team';
    
    // Return HTML with proper OG tags
    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${articleTitle} - LUUKU MAG</title>
    <meta name="description" content="${articleDescription}" />
    <link rel="canonical" href="${articleUrl}" />
    
    <!-- OpenGraph tags -->
    <meta property="og:title" content="${articleTitle}" />
    <meta property="og:description" content="${articleDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${articleImage}" />
    <meta property="og:site_name" content="LUUKU MAG" />
    <meta property="article:published_time" content="${article.published_at}" />
    <meta property="article:modified_time" content="${article.updated_at}" />
    <meta property="article:section" content="${article.category}" />
    <meta property="article:author" content="${articleAuthor}" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@luukumag" />
    <meta name="twitter:title" content="${articleTitle}" />
    <meta name="twitter:description" content="${articleDescription}" />
    <meta name="twitter:image" content="${articleImage}" />
    
    <meta http-equiv="refresh" content="0;url=/article/${article.slug || article.id}" />
  </head>
  <body>
    <p>Redirecting to article...</p>
  </body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).send('Internal server error');
  }
}
