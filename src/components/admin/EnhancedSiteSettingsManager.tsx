import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, GlobeIcon, SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  features: {
    commentsEnabled: boolean;
    likesEnabled: boolean;
    newsletterEnabled: boolean;
    donationsEnabled: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterHandle: string;
  };
}

const EnhancedSiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Luuku Magazine",
    siteDescription: "Your trusted source for news and updates",
    siteUrl: "https://luuku-mag-online.vercel.app",
    logoUrl: "/lovable-uploads/logo.png",
    favicon: "",
    contactEmail: "contact@luukumag.com",
    contactPhone: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    features: {
      commentsEnabled: true,
      likesEnabled: true,
      newsletterEnabled: true,
      donationsEnabled: true,
    },
    seo: {
      metaTitle: "LUUKU MAG - Modern Online Magazine",
      metaDescription: "LUUKU MAG - Your source for news, culture, politics, finance, technology and more",
      metaKeywords: "news, technology, world, opportunities, magazine",
      ogTitle: "LUUKU MAG - Modern Online Magazine",
      ogDescription: "LUUKU MAG - Your source for news, culture, politics, finance, technology and more",
      ogImage: "https://luuku-mag-online.vercel.app/lovable-uploads/logo.png",
      twitterHandle: "@luukumag",
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

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

        setSettings({
          siteName: (typeof settingsMap.site_name === 'string' ? settingsMap.site_name : settings.siteName),
          siteDescription: (typeof settingsMap.site_description === 'string' ? settingsMap.site_description : settings.siteDescription),
          siteUrl: (typeof settingsMap.site_url === 'string' ? settingsMap.site_url : settings.siteUrl),
          logoUrl: (typeof settingsMap.logo_url === 'string' ? settingsMap.logo_url : settings.logoUrl),
          favicon: (typeof settingsMap.favicon === 'string' ? settingsMap.favicon : settings.favicon),
          contactEmail: (typeof settingsMap.contact_email === 'string' ? settingsMap.contact_email : settings.contactEmail),
          contactPhone: (typeof settingsMap.contact_phone === 'string' ? settingsMap.contact_phone : settings.contactPhone),
          socialMedia: (typeof settingsMap.social_media === 'object' ? settingsMap.social_media : settings.socialMedia),
          features: (typeof settingsMap.features === 'object' ? settingsMap.features : settings.features),
          seo: (typeof settingsMap.seo_meta === 'object' ? settingsMap.seo_meta : settings.seo),
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
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
        { key: 'site_name', value: settings.siteName, type: 'general' },
        { key: 'site_description', value: settings.siteDescription, type: 'general' },
        { key: 'site_url', value: settings.siteUrl, type: 'general' },
        { key: 'logo_url', value: settings.logoUrl, type: 'general' },
        { key: 'favicon', value: settings.favicon, type: 'general' },
        { key: 'contact_email', value: settings.contactEmail, type: 'general' },
        { key: 'contact_phone', value: settings.contactPhone, type: 'general' },
        { key: 'social_media', value: settings.socialMedia, type: 'social' },
        { key: 'features', value: settings.features, type: 'features' },
        { key: 'seo_meta', value: settings.seo, type: 'seo' },
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
        title: "Settings Saved",
        description: "Site settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof SiteSettings, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading site settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Site Configuration
          </h3>
          <p className="text-sm text-muted-foreground">Manage your website's settings and configuration</p>
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

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Configure your site's basic details and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+250 XXX XXX XXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/50 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Configure your social media links and presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={settings.socialMedia.twitter}
                  onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/youraccount"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={settings.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={settings.socialMedia.linkedin}
                  onChange={(e) => handleInputChange('socialMedia', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/50 dark:border-green-800">
          <CardHeader>
            <CardTitle>Site Features</CardTitle>
            <CardDescription>Enable or disable site functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="commentsEnabled">Comments System</Label>
                <p className="text-sm text-muted-foreground">Allow users to comment on articles</p>
              </div>
              <Switch
                id="commentsEnabled"
                checked={settings.features.commentsEnabled}
                onCheckedChange={(checked) => handleInputChange('features', 'commentsEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="likesEnabled">Likes System</Label>
                <p className="text-sm text-muted-foreground">Allow users to like articles</p>
              </div>
              <Switch
                id="likesEnabled"
                checked={settings.features.likesEnabled}
                onCheckedChange={(checked) => handleInputChange('features', 'likesEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newsletterEnabled">Newsletter</Label>
                <p className="text-sm text-muted-foreground">Enable newsletter subscriptions</p>
              </div>
              <Switch
                id="newsletterEnabled"
                checked={settings.features.newsletterEnabled}
                onCheckedChange={(checked) => handleInputChange('features', 'newsletterEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="donationsEnabled">Donations</Label>
                <p className="text-sm text-muted-foreground">Enable donation functionality</p>
              </div>
              <Switch
                id="donationsEnabled"
                checked={settings.features.donationsEnabled}
                onCheckedChange={(checked) => handleInputChange('features', 'donationsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO & Open Graph Settings */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 dark:border-purple-800">
          <CardHeader>
            <CardTitle>SEO & Open Graph Settings</CardTitle>
            <CardDescription>Configure meta tags for search engines and social media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={settings.seo.metaTitle}
                onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                placeholder="Your Site - Description"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={settings.seo.metaDescription}
                onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                rows={2}
                placeholder="A compelling description for search results"
              />
            </div>
            <div>
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={settings.seo.metaKeywords}
                onChange={(e) => handleInputChange('seo', 'metaKeywords', e.target.value)}
                placeholder="news, technology, world, opportunities"
              />
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Open Graph (Social Media Preview)</h4>
              <div>
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={settings.seo.ogTitle}
                  onChange={(e) => handleInputChange('seo', 'ogTitle', e.target.value)}
                  placeholder="Title when shared on social media"
                />
              </div>
              <div>
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  value={settings.seo.ogDescription}
                  onChange={(e) => handleInputChange('seo', 'ogDescription', e.target.value)}
                  rows={2}
                  placeholder="Description when shared on social media"
                />
              </div>
              <div>
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  value={settings.seo.ogImage}
                  onChange={(e) => handleInputChange('seo', 'ogImage', e.target.value)}
                  placeholder="https://yoursite.com/image.png"
                />
                <p className="text-xs text-muted-foreground mt-1">Full URL to image (recommended: 1200x630px)</p>
              </div>
              <div>
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={settings.seo.twitterHandle}
                  onChange={(e) => handleInputChange('seo', 'twitterHandle', e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedSiteSettingsManager;