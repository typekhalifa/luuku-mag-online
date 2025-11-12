import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Use Vercel environment variables (not VITE_ prefixed for serverless functions)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nzdtjhnwkrsyerghdppm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZHRqaG53a3JzeWVyZ2hkcHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxOTg1MjUsImV4cCI6MjA2MDc3NDUyNX0.JC-mU_B_kQvi7Pm0zZgbE4OjE5utbm2ObFHRG1axY1M';

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  slug: string | null;
  category: string;
  author: string | null;
  published_at: string;
  updated_at: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).send('Article ID required');
  }
  
  // Check if it's a bot/crawler - MORE aggressive detection
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  // Comprehensive bot detection including all major social media crawlers
  const botPatterns = [
    'facebookexternalhit', 'facebot', 'facebook', 
    'twitterbot', 'twitter',
    'linkedinbot', 'linkedin',
    'whatsapp', 'whatsappbot',
    'telegrambot', 'telegram',
    'slackbot', 'slack',
    'discordbot', 'discord',
    'pinterest', 'pinterestbot',
    'tumblr', 'reddit',
    'instagram', 'instagrambot',
    'skype', 'skypebot',
    'googlebot', 'bingbot', 'yandex',
    'bot', 'crawler', 'spider', 'crawling', 'scraper'
  ];
  
  const isCrawler = botPatterns.some(pattern => userAgent.includes(pattern));
  
  console.log(`Request from: ${req.headers['user-agent']?.substring(0, 100) || 'unknown'}`);
  console.log(`Is Crawler: ${isCrawler}`);
  
  // If not a crawler, redirect to the SPA
  if (!isCrawler) {
    return res.redirect(307, `/articles/${id}`);
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
      console.error('Article fetch error:', error);
      return res.status(404).send(getNotFoundHTML());
    }
    
    // FIXED: Use /articles/ path (with 's')
    const articleUrl = `https://luukumag.com/articles/${article.slug || article.id}`;
    const articleImage = article.image_url || 'https://luukumag.com/lovable-uploads/logo.png';
    
    // Better HTML escaping
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
    
    // Return HTML with proper OG tags
    const html = generateArticleHTML({
      title: articleTitle,
      description: articleDescription,
      url: articleUrl,
      image: articleImage,
      author: articleAuthor,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      category: article.category,
    });
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).send(getErrorHTML());
  }
}

function generateArticleHTML(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-WN95RSFZDC"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WN95RSFZDC');
    </script>
    
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.title} - LUUKU MAG</title>
    <meta name="description" content="${data.description}" />
    <link rel="canonical" href="${data.url}" />
    
    <!-- Essential OpenGraph tags for Facebook -->
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${data.url}" />
    <meta property="og:image" content="${data.image}" />
    <meta property="og:image:secure_url" content="${data.image}" />
    <meta property="og:image:type" content="image/jpeg" />
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
    
    <!-- Additional meta tags for other platforms -->
    <meta itemprop="name" content="${data.title}" />
    <meta itemprop="description" content="${data.description}" />
    <meta itemprop="image" content="${data.image}" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Structured Data for Google -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${data.title}",
      "description": "${data.description}",
      "image": {
        "@type": "ImageObject",
        "url": "${data.image}",
        "width": 1200,
        "height": 630
      },
      "datePublished": "${data.publishedAt}",
      "dateModified": "${data.updatedAt}",
      "author": {
        "@type": "Person",
        "name": "${data.author}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "LUUKU MAG",
        "logo": {
          "@type": "ImageObject",
          "url": "https://luukumag.com/lovable-uploads/logo.png",
          "width": 200,
          "height": 60
        }
      },
      "articleSection": "${data.category}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${data.url}"
      }
    }
    </script>
  </head>
  <body style="margin: 0; padding: 20px; font-family: Inter, system-ui, sans-serif; background: #1a1f2e; color: #fff;">
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; padding: 40px 0;">
        <h1 style="color: #ff6b35; margin-bottom: 10px; font-family: Poppins, sans-serif;">LUUKU MAG</h1>
        <p style="color: #94a3b8;">Modern Online Magazine</p>
      </div>
      <article>
        <header style="margin-bottom: 2rem;">
          <div style="color: #ff6b35; text-transform: uppercase; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
            ${data.category}
          </div>
          <h2 style="font-size: 2.5rem; line-height: 1.2; margin: 0 0 1rem 0; font-family: Poppins, sans-serif;">
            ${data.title}
          </h2>
          <div style="color: #94a3b8; font-size: 0.875rem;">
            By ${data.author} • ${new Date(data.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 2rem;" />
        <p style="color: #cbd5e1; line-height: 1.8; font-size: 1.125rem;">
          ${data.description}
        </p>
        <a href="${data.url}" style="display: inline-block; margin-top: 2rem; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Read Full Article
        </a>
      </article>
    </div>
  </body>
</html>`;
}

function getNotFoundHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Article Not Found - LUUKU MAG</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: system-ui; background: #1a1f2e; color: #fff; text-align: center;">
    <h1 style="color: #ff6b35;">Article Not Found</h1>
    <p>The article you're looking for doesn't exist.</p>
    <a href="https://luukumag.com" style="color: #ff6b35;">Return to Homepage</a>
  </body>
</html>`;
}

function getErrorHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Error - LUUKU MAG</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: system-ui; background: #1a1f2e; color: #fff; text-align: center;">
    <h1 style="color: #ff6b35;">Something Went Wrong</h1>
    <p>We're having trouble loading this article.</p>
    <a href="https://luukumag.com" style="color: #ff6b35;">Return to Homepage</a>
  </body>
</html>`;
}
