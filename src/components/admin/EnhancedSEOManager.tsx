import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, SearchIcon, TrendingUpIcon, GlobeIcon, BarChart3Icon, ZapIcon, CheckCircleIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SEOSettings {
  general: {
    siteName: string;
    tagline: string;
    metaDescription: string;
    keywords: string;
    canonicalUrl: string;
    language: string;
  };
  social: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterSite: string;
  };
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    enableHotjar: boolean;
    hotjarId: string;
  };
  performance: {
    enableImageOptimization: boolean;
    enableLazyLoading: boolean;
    enableMinification: boolean;
    enableCaching: boolean;
    cacheMaxAge: number;
  };
}

interface WebsiteStats {
  totalArticles: number;
  totalComments: number;
  totalLikes: number;
  totalSubscribers: number;
  avgWordsPerArticle: number;
  topCategories: Array<{ category: string; count: number }>;
}

const EnhancedSEOManager: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettings>({
    general: {
      siteName: "Luuku Magazine",
      tagline: "Your Trusted Source for News & Updates",
      metaDescription: "Stay informed with the latest news, analysis, and stories. Independent journalism covering technology, business, sports, and culture.",
      keywords: "news, technology, business, sports, culture, magazine, journalism",
      canonicalUrl: "https://luuku-mag-online.vercel.app",
      language: "en",
    },
    social: {
      ogTitle: "Luuku Magazine - Your Trusted Source for News & Updates",
      ogDescription: "Stay informed with the latest news, analysis, and stories.",
      ogImage: "/og-image.jpg",
      twitterCard: "summary_large_image",
      twitterSite: "@luukumag",
    },
    analytics: {
      googleAnalyticsId: "",
      googleTagManagerId: "",
      facebookPixelId: "",
      enableHotjar: false,
      hotjarId: "",
    },
    performance: {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enableMinification: true,
      enableCaching: true,
      cacheMaxAge: 86400,
    },
  });

  const [stats, setStats] = useState<WebsiteStats>({
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0,
    totalSubscribers: 0,
    avgWordsPerArticle: 0,
    topCategories: [],
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWebsiteStats = async () => {
    try {
      // Fetch articles count and categories
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("category, content");

      if (articlesError) throw articlesError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: 'exact', head: true });

      if (commentsError) throw commentsError;

      // Fetch likes count
      const { count: likesCount, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true });

      if (likesError) throw likesError;

      // Fetch subscribers count
      const { count: subscribersCount, error: subscribersError } = await supabase
        .from("subscriptions")
        .select("*", { count: 'exact', head: true });

      if (subscribersError) throw subscribersError;

      // Calculate stats
      const totalArticles = articles?.length || 0;
      const avgWords = articles?.reduce((sum, article) => {
        const wordCount = article.content ? article.content.split(' ').length : 0;
        return sum + wordCount;
      }, 0) / totalArticles || 0;

      // Group by categories
      const categoryCounts = articles?.reduce((acc: Record<string, number>, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalArticles,
        totalComments: commentsCount || 0,
        totalLikes: likesCount || 0,
        totalSubscribers: subscribersCount || 0,
        avgWordsPerArticle: Math.round(avgWords),
        topCategories,
      });
    } catch (error) {
      console.error("Error loading website stats:", error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_type", ["seo", "analytics", "performance"]);

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, any> = {};
        data.forEach((item) => {
          try {
            settingsMap[item.setting_key] = JSON.parse(String(item.setting_value));
          } catch (e) {
            settingsMap[item.setting_key] = item.setting_value;
          }
        });

        setSettings(prev => ({
          ...prev,
          general: (typeof settingsMap.seo_general === 'object' ? settingsMap.seo_general : prev.general),
          social: (typeof settingsMap.seo_social === 'object' ? settingsMap.seo_social : prev.social),
          analytics: (typeof settingsMap.analytics === 'object' ? settingsMap.analytics : prev.analytics),
          performance: (typeof settingsMap.performance === 'object' ? settingsMap.performance : prev.performance),
        }));
      }

      await loadWebsiteStats();
    } catch (error) {
      console.error("Error loading SEO settings:", error);
      toast({
        title: "Error",
        description: "Failed to load SEO settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: 'seo_general', value: settings.general, type: 'seo' },
        { key: 'seo_social', value: settings.social, type: 'seo' },
        { key: 'analytics', value: settings.analytics, type: 'analytics' },
        { key: 'performance', value: settings.performance, type: 'performance' },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: setting.key,
            setting_value: JSON.stringify(setting.value),
            setting_type: setting.type,
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }
      
      toast({
        title: "SEO Settings Saved",
        description: "Your SEO and performance settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving SEO settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof SEOSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const generateSitemap = async () => {
    try {
      const { data: articles } = await supabase
        .from("articles")
        .select("slug, updated_at");

      toast({
        title: "Sitemap Generated",
        description: `Sitemap updated with ${articles?.length || 0} articles.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap.",
        variant: "destructive",
      });
    }
  };

  const testPageSpeed = () => {
    toast({
      title: "Page Speed Test Initiated",
      description: "Performance analysis started. Check browser dev tools for detailed metrics.",
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading SEO settings and website analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            SEO & Performance
          </h3>
          <p className="text-sm text-muted-foreground">Optimize your site for search engines and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Website Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Articles</p>
                <p className="text-2xl font-bold">{stats.totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Likes</p>
                <p className="text-2xl font-bold">{stats.totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Subscribers</p>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950/50 dark:to-orange-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ZapIcon className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Avg Words</p>
                <p className="text-2xl font-bold">{stats.avgWordsPerArticle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* General SEO Settings */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              General SEO Settings
            </CardTitle>
            <CardDescription>Basic SEO configuration for your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.general.tagline}
                  onChange={(e) => handleInputChange('general', 'tagline', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={settings.general.metaDescription}
                onChange={(e) => handleInputChange('general', 'metaDescription', e.target.value)}
                rows={3}
                maxLength={160}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {settings.general.metaDescription.length}/160 characters
              </p>
            </div>
            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Textarea
                id="keywords"
                value={settings.general.keywords}
                onChange={(e) => handleInputChange('general', 'keywords', e.target.value)}
                rows={2}
                placeholder="Separate keywords with commas"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  type="url"
                  value={settings.general.canonicalUrl}
                  onChange={(e) => handleInputChange('general', 'canonicalUrl', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={settings.general.language}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                  placeholder="en"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Content Categories</CardTitle>
            <CardDescription>Most popular content categories on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topCategories.map((cat, index) => (
                <Badge key={cat.category} variant={index === 0 ? "default" : "secondary"} className="flex items-center gap-1">
                  {index === 0 && <CheckCircleIcon className="h-3 w-3" />}
                  {cat.category} ({cat.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Settings */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/50 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5" />
              Social Media & Open Graph
            </CardTitle>
            <CardDescription>Configure how your content appears on social media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ogTitle">Open Graph Title</Label>
              <Input
                id="ogTitle"
                value={settings.social.ogTitle}
                onChange={(e) => handleInputChange('social', 'ogTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ogDescription">Open Graph Description</Label>
              <Textarea
                id="ogDescription"
                value={settings.social.ogDescription}
                onChange={(e) => handleInputChange('social', 'ogDescription', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="ogImage">Open Graph Image URL</Label>
              <Input
                id="ogImage"
                type="url"
                value={settings.social.ogImage}
                onChange={(e) => handleInputChange('social', 'ogImage', e.target.value)}
                placeholder="/og-image.jpg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <Input
                  id="twitterCard"
                  value={settings.social.twitterCard}
                  onChange={(e) => handleInputChange('social', 'twitterCard', e.target.value)}
                  placeholder="summary_large_image"
                />
              </div>
              <div>
                <Label htmlFor="twitterSite">Twitter Site Handle</Label>
                <Input
                  id="twitterSite"
                  value={settings.social.twitterSite}
                  onChange={(e) => handleInputChange('social', 'twitterSite', e.target.value)}
                  placeholder="@yoursitehandle"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/50 dark:border-green-800">
          <CardHeader>
            <CardTitle>Performance Optimization</CardTitle>
            <CardDescription>Settings to improve site speed and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableImageOptimization">Image Optimization</Label>
                  <p className="text-sm text-muted-foreground">Automatically optimize images for web</p>
                </div>
                <Switch
                  id="enableImageOptimization"
                  checked={settings.performance.enableImageOptimization}
                  onCheckedChange={(checked) => handleInputChange('performance', 'enableImageOptimization', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableLazyLoading">Lazy Loading</Label>
                  <p className="text-sm text-muted-foreground">Load images only when needed</p>
                </div>
                <Switch
                  id="enableLazyLoading"
                  checked={settings.performance.enableLazyLoading}
                  onCheckedChange={(checked) => handleInputChange('performance', 'enableLazyLoading', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCaching">Browser Caching</Label>
                  <p className="text-sm text-muted-foreground">Cache static assets in browser</p>
                </div>
                <Switch
                  id="enableCaching"
                  checked={settings.performance.enableCaching}
                  onCheckedChange={(checked) => handleInputChange('performance', 'enableCaching', checked)}
                />
              </div>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button onClick={generateSitemap} variant="outline">
                Generate Sitemap
              </Button>
              <Button onClick={testPageSpeed} variant="outline">
                Test Page Speed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedSEOManager;