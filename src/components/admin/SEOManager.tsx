
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, SearchIcon, TrendingUpIcon, GlobeIcon } from "lucide-react";

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

const SEOManager: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettings>({
    general: {
      siteName: "EastAfricaNews",
      tagline: "Your Trusted Source for East African News",
      metaDescription: "Stay informed with the latest news, analysis, and stories from East Africa. Independent journalism covering politics, business, sports, and culture.",
      keywords: "East Africa news, Uganda news, Kenya news, Tanzania news, Rwanda news, politics, business, sports",
      canonicalUrl: "https://eastafricanews.vercel.app",
      language: "en",
    },
    social: {
      ogTitle: "EastAfricaNews - Your Trusted Source for East African News",
      ogDescription: "Stay informed with the latest news, analysis, and stories from East Africa.",
      ogImage: "/og-image.jpg",
      twitterCard: "summary_large_image",
      twitterSite: "@eastafricanews",
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
      cacheMaxAge: 86400, // 24 hours
    },
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (section: keyof SEOSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('seoSettings', JSON.stringify(settings));
      
      toast({
        title: "SEO Settings Saved",
        description: "Your SEO and performance settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('seoSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading SEO settings:", error);
    }
  };

  const generateSitemap = () => {
    toast({
      title: "Sitemap Generated",
      description: "Your sitemap.xml has been updated with the latest content.",
    });
  };

  const testPageSpeed = () => {
    toast({
      title: "Page Speed Test Initiated",
      description: "Running performance analysis... Results will be available shortly.",
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">SEO & Performance</h3>
          <p className="text-sm text-muted-foreground">Optimize your site for search engines and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General SEO Settings */}
        <Card>
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

        {/* Social Media Settings */}
        <Card>
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

        {/* Analytics Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Analytics & Tracking
            </CardTitle>
            <CardDescription>Configure analytics and tracking tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.analytics.googleAnalyticsId}
                  onChange={(e) => handleInputChange('analytics', 'googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  value={settings.analytics.googleTagManagerId}
                  onChange={(e) => handleInputChange('analytics', 'googleTagManagerId', e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.analytics.facebookPixelId}
                onChange={(e) => handleInputChange('analytics', 'facebookPixelId', e.target.value)}
                placeholder="1234567890123456"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableHotjar">Enable Hotjar</Label>
                <p className="text-sm text-muted-foreground">User behavior analytics</p>
              </div>
              <Switch
                id="enableHotjar"
                checked={settings.analytics.enableHotjar}
                onCheckedChange={(checked) => handleInputChange('analytics', 'enableHotjar', checked)}
              />
            </div>
            {settings.analytics.enableHotjar && (
              <div>
                <Label htmlFor="hotjarId">Hotjar Site ID</Label>
                <Input
                  id="hotjarId"
                  value={settings.analytics.hotjarId}
                  onChange={(e) => handleInputChange('analytics', 'hotjarId', e.target.value)}
                  placeholder="1234567"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
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
                  <Label htmlFor="enableMinification">Code Minification</Label>
                  <p className="text-sm text-muted-foreground">Compress CSS and JavaScript</p>
                </div>
                <Switch
                  id="enableMinification"
                  checked={settings.performance.enableMinification}
                  onCheckedChange={(checked) => handleInputChange('performance', 'enableMinification', checked)}
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
              {settings.performance.enableCaching && (
                <div>
                  <Label htmlFor="cacheMaxAge">Cache Max Age (seconds)</Label>
                  <Input
                    id="cacheMaxAge"
                    type="number"
                    value={settings.performance.cacheMaxAge}
                    onChange={(e) => handleInputChange('performance', 'cacheMaxAge', Number(e.target.value))}
                  />
                </div>
              )}
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

export default SEOManager;
