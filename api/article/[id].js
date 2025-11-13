// Vercel Serverless Function for Article Social Previews
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nzdtjhnwkrsyerghdppm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZHRqaG53a3JzeWVyZ2hkcHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxOTg1MjUsImV4cCI6MjA2MDc3NDUyNX0.JC-mU_B_kQvi7Pm0zZgbE4OjE5utbm2ObFHRG1axY1M';

module.exports = async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).send('Article ID required');
  }
  
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  const botPatterns = [
    'facebookexternalhit', 'facebot', 'facebook',
    'twitterbot', 'twitter',
    'linkedinbot', 'linkedin',
    'whatsapp', 'whatsappbot',
    'telegrambot', 'telegram',
    'slackbot', 'slack',
    'discordbot', 'discord',
    'pinterest', 'pinterestbot',
    'bot', 'crawler', 'spider'
  ];
  
  const isCrawler = botPatterns.some(pattern => userAgent.includes(pattern));
  
  console.log(`Request from: ${userAgent.substring(0, 100)}`);
  console.log(`Is Crawler: ${isCrawler}`);
  console.log(`Article ID: ${id}`);
  
  // If not a crawler, serve HTML that redirects directly to the article
  if (!isCrawler) {
    const redirectPage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/articles/${id}">
  <title>Loading article...</title>
</head>
<body>
  <script>window.location.replace('/articles/${id}');</script>
  <p>Loading article...</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(redirectPage);
  }
  
  // For crawlers, continue to generate proper meta tags below
  
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
      console.error('Article fetch error:', error);
      return res.status(404).send(getNotFoundHTML());
    }
    
    const articleUrl = `https://www.luukumag.com/articles/${article.slug || article.id}`;
    
    // Ensure image URL is absolute with www and proper extension
    let articleImage = article.image_url;
    
    console.log('=== IMAGE URL DEBUG ===');
    console.log('Raw article.image_url:', article.image_url);
    
    if (!articleImage || articleImage.trim() === '') {
      console.log('No image found, using fallback logo');
      articleImage = 'https://www.luukumag.com/lovable-uploads/logo.png';
    } else if (!articleImage.startsWith('http')) {
      // Relative URL - make it absolute with www
      console.log('Converting relative URL to absolute');
      articleImage = `https://www.luukumag.com${articleImage.startsWith('/') ? '' : '/'}${articleImage}`;
    } else if (articleImage.includes('luukumag.com')) {
      // Already absolute luukumag URL - ensure www subdomain
      console.log('Ensuring www subdomain for luukumag URL');
      articleImage = articleImage.replace('://luukumag.com/', '://www.luukumag.com/');
      articleImage = articleImage.replace('://luukumag.com:', '://www.luukumag.com:');
    }
    // If it's a Supabase or other external URL, leave it as-is
    
    console.log('Final articleImage:', articleImage);
    console.log('======================');
    
    console.log('Article URL:', articleUrl);
    console.log('Article Image from DB:', article.image_url);
    console.log('Final Article Image:', articleImage);
    
    // Determine image type from URL
    const imageExtension = articleImage.split('.').pop()?.toLowerCase() || 'jpeg';
    const imageType = imageExtension === 'png' ? 'image/png' : 'image/jpeg';
    
    const escapeHtml = (text) => {
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
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).send(getErrorHTML());
  }
};

function generateArticleHTML(data) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.title} - LUUKU MAG</title>
    <meta name="description" content="${data.description}" />
    <link rel="canonical" href="${data.url}" />
    
    <!-- Essential OpenGraph tags for Facebook -->
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
    
    <!-- Article metadata -->
    <meta property="article:published_time" content="${data.publishedAt}" />
    <meta property="article:modified_time" content="${data.updatedAt}" />
    <meta property="article:section" content="${data.category}" />
    <meta property="article:author" content="${data.author}" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@luukumag" />
    <meta name="twitter:creator" content="@luukumag" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    <meta name="twitter:image" content="${data.image}" />
    <meta name="twitter:image:alt" content="${data.title}" />
    
    <!-- Redirect to actual article after meta tags load -->
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

function getNotFoundHTML() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Article Not Found - LUUKU MAG</title>
  </head>
  <body>
    <h1>404 - Article Not Found</h1>
    <a href="https://www.luukumag.com">Return to Home</a>
  </body>
</html>`;
}

function getErrorHTML() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Error - LUUKU MAG</title>
  </head>
  <body>
    <h1>Error Loading Article</h1>
    <a href="https://www.luukumag.com">Return to Home</a>
  </body>
</html>`;
}
