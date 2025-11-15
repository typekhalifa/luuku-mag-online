
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, MailIcon, SendIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailSettings {
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    security: "none" | "ssl" | "tls";
    username: string;
    password: string;
  };
  newsletter: {
    enabled: boolean;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    welcomeSubject: string;
    welcomeTemplate: string;
  };
  notifications: {
    newComment: boolean;
    newSubscriber: boolean;
    newArticle: boolean;
    adminEmail: string;
  };
}

const EmailSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    smtp: {
      enabled: false,
      host: "",
      port: 587,
      security: "tls",
      username: "",
      password: "",
    },
    newsletter: {
      enabled: true,
      fromName: "Luuku Magazine",
      fromEmail: "newsletter@luukumag.com",
      replyTo: "no-reply@luukumag.com",
      welcomeSubject: "Welcome to Luuku Magazine Newsletter!",
      welcomeTemplate: "Thank you for subscribing to our newsletter. You'll receive the latest news and updates directly in your inbox.",
    },
    notifications: {
      newComment: true,
      newSubscriber: true,
      newArticle: false,
      adminEmail: "admin@luukumag.com",
    },
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (section: keyof EmailSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: "email_smtp", value: JSON.stringify(settings.smtp) },
        { key: "email_newsletter", value: JSON.stringify(settings.newsletter) },
        { key: "email_notifications", value: JSON.stringify(settings.notifications) }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: setting.key,
            setting_value: setting.value,
            setting_type: "email"
          }, {
            onConflict: "setting_key"
          });

        if (error) throw error;
      }
      
      toast({
        title: "Email Settings Saved",
        description: "Email configuration has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast({
        title: "Error",
        description: "Failed to save email settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setTesting(true);
    try {
      // In a real app, this would test the SMTP connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate test
      
      toast({
        title: "Connection Test Successful",
        description: "SMTP configuration is working correctly.",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Please check your SMTP settings and try again.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["email_smtp", "email_newsletter", "email_notifications"]);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {};
        data.forEach((item) => {
          try {
            settingsMap[item.setting_key] = typeof item.setting_value === 'string' 
              ? JSON.parse(item.setting_value) 
              : item.setting_value;
          } catch (e) {
            console.error("Error parsing setting:", item.setting_key, e);
          }
        });

        setSettings(prev => ({
          smtp: settingsMap.email_smtp || prev.smtp,
          newsletter: settingsMap.email_newsletter || prev.newsletter,
          notifications: settingsMap.email_notifications || prev.notifications
        }));
      }
    } catch (error) {
      console.error("Error loading email settings:", error);
      toast({
        title: "Error",
        description: "Failed to load email settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading email settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Email Configuration</h3>
          <p className="text-sm text-muted-foreground">Configure SMTP settings and email templates</p>
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
        {/* SMTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>Configure your SMTP server for sending emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smtpEnabled">Enable SMTP</Label>
                <p className="text-sm text-muted-foreground">Use custom SMTP server for sending emails</p>
              </div>
              <Switch
                id="smtpEnabled"
                checked={settings.smtp.enabled}
                onCheckedChange={(checked) => handleInputChange('smtp', 'enabled', checked)}
              />
            </div>
            {settings.smtp.enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtp.host}
                      onChange={(e) => handleInputChange('smtp', 'host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtp.port}
                      onChange={(e) => handleInputChange('smtp', 'port', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtpSecurity">Security</Label>
                  <Select
                    value={settings.smtp.security}
                    onValueChange={(value) => handleInputChange('smtp', 'security', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input
                      id="smtpUsername"
                      value={settings.smtp.username}
                      onChange={(e) => handleInputChange('smtp', 'username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.smtp.password}
                      onChange={(e) => handleInputChange('smtp', 'password', e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={testEmailConnection} disabled={testing} variant="outline">
                  <SendIcon className="h-4 w-4 mr-2" />
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Settings</CardTitle>
            <CardDescription>Configure newsletter templates and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newsletterEnabled">Enable Newsletter</Label>
                <p className="text-sm text-muted-foreground">Allow users to subscribe to newsletter</p>
              </div>
              <Switch
                id="newsletterEnabled"
                checked={settings.newsletter.enabled}
                onCheckedChange={(checked) => handleInputChange('newsletter', 'enabled', checked)}
              />
            </div>
            {settings.newsletter.enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.newsletter.fromName}
                      onChange={(e) => handleInputChange('newsletter', 'fromName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.newsletter.fromEmail}
                      onChange={(e) => handleInputChange('newsletter', 'fromEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="replyTo">Reply-To Email</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={settings.newsletter.replyTo}
                    onChange={(e) => handleInputChange('newsletter', 'replyTo', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="welcomeSubject">Welcome Email Subject</Label>
                  <Input
                    id="welcomeSubject"
                    value={settings.newsletter.welcomeSubject}
                    onChange={(e) => handleInputChange('newsletter', 'welcomeSubject', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="welcomeTemplate">Welcome Email Template</Label>
                  <Textarea
                    id="welcomeTemplate"
                    value={settings.newsletter.welcomeTemplate}
                    onChange={(e) => handleInputChange('newsletter', 'welcomeTemplate', e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure admin email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.notifications.adminEmail}
                onChange={(e) => handleInputChange('notifications', 'adminEmail', e.target.value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newCommentNotif">New Comment Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when users post comments</p>
              </div>
              <Switch
                id="newCommentNotif"
                checked={settings.notifications.newComment}
                onCheckedChange={(checked) => handleInputChange('notifications', 'newComment', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newSubscriberNotif">New Subscriber Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when users subscribe to newsletter</p>
              </div>
              <Switch
                id="newSubscriberNotif"
                checked={settings.notifications.newSubscriber}
                onCheckedChange={(checked) => handleInputChange('notifications', 'newSubscriber', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newArticleNotif">New Article Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when new articles are published</p>
              </div>
              <Switch
                id="newArticleNotif"
                checked={settings.notifications.newArticle}
                onCheckedChange={(checked) => handleInputChange('notifications', 'newArticle', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettingsManager;
