
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon } from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  favicon: string;
  contactEmail: string;
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
  };
}

const SiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Luuku Magazine",
    siteDescription: "Your trusted source for news and updates",
    siteUrl: "https://luuku-mag-online.vercel.app",
    logoUrl: "",
    favicon: "",
    contactEmail: "contact@luukumag.com",
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
      metaTitle: "Luuku Magazine - Latest News & Updates",
      metaDescription: "Stay informed with the latest news, technology updates, and opportunities from around the world.",
      metaKeywords: "news, technology, world, opportunities, magazine",
    },
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (section: keyof SiteSettings, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to a settings table or configuration service
      // For now, we'll just simulate saving to localStorage
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('siteSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Site Configuration</h3>
          <p className="text-sm text-muted-foreground">Manage your website's basic settings</p>
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Configure your site's basic details</CardDescription>
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
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Configure your social media links</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Site Features</CardTitle>
            <CardDescription>Enable or disable site features</CardDescription>
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

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Configure search engine optimization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={settings.seo.metaTitle}
                onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={settings.seo.metaDescription}
                onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                rows={3}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
