import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface Template {
  name: string;
  subject: string;
  content: string;
  description: string;
}

const templates: Template[] = [
  {
    name: "Weekly Roundup",
    subject: "📰 Your Weekly LUUKU MAG Roundup",
    description: "Perfect for weekly newsletter with top stories",
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px; }
    .article { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e0e0e0; }
    .article:last-child { border-bottom: none; }
    .article img { width: 100%; border-radius: 8px; margin-bottom: 15px; }
    .article h2 { color: #667eea; margin-bottom: 10px; }
    .read-more { display: inline-block; padding: 10px 25px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 This Week at LUUKU MAG</h1>
      <p>The stories you don't want to miss</p>
    </div>
    <div class="content">
      <p>Hello there! 👋</p>
      <p>Here are this week's top stories handpicked just for you:</p>
      
      <div class="article">
        <img src="[ARTICLE_IMAGE_1]" alt="Article 1" />
        <h2>[ARTICLE_TITLE_1]</h2>
        <p>[ARTICLE_EXCERPT_1]</p>
        <a href="[ARTICLE_LINK_1]" class="read-more">Read Full Story →</a>
      </div>

      <div class="article">
        <img src="[ARTICLE_IMAGE_2]" alt="Article 2" />
        <h2>[ARTICLE_TITLE_2]</h2>
        <p>[ARTICLE_EXCERPT_2]</p>
        <a href="[ARTICLE_LINK_2]" class="read-more">Read Full Story →</a>
      </div>

      <div class="article">
        <img src="[ARTICLE_IMAGE_3]" alt="Article 3" />
        <h2>[ARTICLE_TITLE_3]</h2>
        <p>[ARTICLE_EXCERPT_3]</p>
        <a href="[ARTICLE_LINK_3]" class="read-more">Read Full Story →</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 LUUKU MAG. All rights reserved.</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    name: "Breaking News Alert",
    subject: "🚨 BREAKING: [Insert Breaking News Title]",
    description: "For urgent breaking news announcements",
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .breaking { background: #dc2626; color: white; padding: 15px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    .hero-image { width: 100%; border-radius: 8px; margin: 20px 0; }
    .cta { display: inline-block; padding: 15px 40px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="breaking">🚨 Breaking News Alert 🚨</div>
    <div class="header">
      <h1>[BREAKING_NEWS_TITLE]</h1>
    </div>
    <div class="content">
      <img src="[HERO_IMAGE]" alt="Breaking News" class="hero-image" />
      
      <p><strong>[LEAD_PARAGRAPH]</strong></p>
      
      <p>[MAIN_CONTENT]</p>
      
      <p>[ADDITIONAL_DETAILS]</p>
      
      <center>
        <a href="[ARTICLE_LINK]" class="cta">Read Full Coverage →</a>
      </center>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Stay tuned to LUUKU MAG for the latest updates on this developing story.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 LUUKU MAG. All rights reserved.</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    name: "Featured Article Spotlight",
    subject: "✨ Must Read: [Article Title]",
    description: "Highlight a single must-read article",
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
    .content { padding: 30px; }
    .featured-image { width: 100%; border-radius: 12px; margin: 20px 0; }
    .author { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .author-avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
    .cta { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">✨ FEATURED ARTICLE</span>
      <h1>[ARTICLE_TITLE]</h1>
      <p>[ARTICLE_SUBTITLE]</p>
    </div>
    <div class="content">
      <img src="[FEATURED_IMAGE]" alt="Featured Article" class="featured-image" />
      
      <p style="font-size: 18px; color: #667eea; font-weight: 500;">[COMPELLING_HOOK]</p>
      
      <p>[ARTICLE_EXCERPT]</p>
      
      <p>[MORE_CONTENT]</p>
      
      <div class="author">
        <img src="[AUTHOR_AVATAR]" alt="Author" class="author-avatar" />
        <div>
          <strong>[AUTHOR_NAME]</strong><br>
          <span style="color: #666; font-size: 14px;">[AUTHOR_BIO]</span>
        </div>
      </div>
      
      <center>
        <a href="[ARTICLE_LINK]" class="cta">Continue Reading →</a>
      </center>
    </div>
    <div class="footer">
      <p>© 2024 LUUKU MAG. All rights reserved.</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    name: "Monthly Digest",
    subject: "📅 Your Monthly LUUKU MAG Digest",
    description: "Comprehensive monthly summary with stats",
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .stats { display: flex; justify-content: space-around; padding: 30px; background: #f8f9fa; }
    .stat { text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #666; }
    .content { padding: 30px; }
    .category { margin: 30px 0; }
    .category h3 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .mini-article { display: flex; margin: 15px 0; }
    .mini-article img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
    .mini-article-content h4 { margin: 0 0 5px 0; font-size: 16px; }
    .mini-article-content p { margin: 0; font-size: 14px; color: #666; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 [MONTH] Digest</h1>
      <p>A month of amazing stories</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-number">[NUM_ARTICLES]</div>
        <div class="stat-label">New Articles</div>
      </div>
      <div class="stat">
        <div class="stat-number">[NUM_VIEWS]</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat">
        <div class="stat-number">[NUM_COMMENTS]</div>
        <div class="stat-label">Comments</div>
      </div>
    </div>

    <div class="content">
      <p>Hello! Here's what happened at LUUKU MAG this month:</p>

      <div class="category">
        <h3>🔥 Most Popular</h3>
        <div class="mini-article">
          <img src="[POP_1_IMAGE]" alt="Popular 1" />
          <div class="mini-article-content">
            <h4>[POP_1_TITLE]</h4>
            <p>[POP_1_EXCERPT]</p>
            <a href="[POP_1_LINK]">Read more →</a>
          </div>
        </div>
      </div>

      <div class="category">
        <h3>✨ Editor's Picks</h3>
        <div class="mini-article">
          <img src="[EDITOR_1_IMAGE]" alt="Editor Pick 1" />
          <div class="mini-article-content">
            <h4>[EDITOR_1_TITLE]</h4>
            <p>[EDITOR_1_EXCERPT]</p>
            <a href="[EDITOR_1_LINK]">Read more →</a>
          </div>
        </div>
      </div>

      <div class="category">
        <h3>📰 Latest News</h3>
        <div class="mini-article">
          <img src="[NEWS_1_IMAGE]" alt="News 1" />
          <div class="mini-article-content">
            <h4>[NEWS_1_TITLE]</h4>
            <p>[NEWS_1_EXCERPT]</p>
            <a href="[NEWS_1_LINK]">Read more →</a>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for being part of our community! 💙</p>
      <p>© 2024 LUUKU MAG. All rights reserved.</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `
  }
];

const NewsletterTemplates = () => {
  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success(`"${template.name}" template copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Newsletter Templates</h2>
        <p className="text-muted-foreground">
          Professional newsletter templates ready to use. Click copy to use in the newsletter composer.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {template.name}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Subject:</span>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Variables to replace:</span>
                  <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                    {template.content.match(/\[([^\]]+)\]/g)?.slice(0, 5).join(", ")}
                    {template.content.match(/\[([^\]]+)\]/g)?.length > 5 && "..."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>💡 How to Use Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Click "Copy" on your chosen template</p>
          <p>2. Go to Newsletter Manager → Compose Newsletter tab</p>
          <p>3. Paste the template into the content field</p>
          <p>4. Replace all [VARIABLES] with your actual content</p>
          <p>5. Make sure to include [UNSUBSCRIBE_LINK] for each subscriber's unique unsubscribe link</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterTemplates;
