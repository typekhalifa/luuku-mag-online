
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailIcon, SendIcon, UsersIcon, DownloadIcon, FileTextIcon, EyeIcon, TrashIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Subscription {
  id: string;
  email: string;
  subscribed_at: string;
  status: string;
  unsubscribed_at?: string;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  template_name: string | null;
  status: string;
  recipients_count: number;
  created_at: string;
  sent_at: string | null;
}

interface Template {
  name: string;
  subject: string;
  content: string;
}

const NewsletterManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newEmail, setNewEmail] = useState("");
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);

  const templates: Template[] = [
    {
      name: "Weekly Roundup",
      subject: "Your Weekly LUUKU MAG Update 📰",
      content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #00d4ff; margin-bottom: 20px;">This Week at LUUKU MAG</h1>
        <p style="color: #333; line-height: 1.6;">Hello!</p>
        <p style="color: #333; line-height: 1.6;">Here's what you might have missed this week...</p>
        <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #00d4ff; margin-bottom: 10px;">Top Stories</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>Story headline 1</li>
            <li>Story headline 2</li>
            <li>Story headline 3</li>
          </ul>
        </div>
        <p style="color: #333; line-height: 1.6;">Stay tuned for more!</p>
        <p style="color: #333; line-height: 1.6;">Best,<br>The LUUKU MAG Team</p>
      </div>`
    },
    {
      name: "Breaking News",
      subject: "🔴 Breaking: Important Update",
      content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ff4444; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0;">🔴 BREAKING NEWS</h2>
        </div>
        <h1 style="color: #333; margin-bottom: 20px;">Headline Goes Here</h1>
        <p style="color: #555; line-height: 1.6;">Your breaking news content...</p>
        <a href="#" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #00d4ff; color: white; text-decoration: none; border-radius: 5px;">Read Full Story</a>
      </div>`
    },
    {
      name: "Announcement",
      subject: "Important Announcement from LUUKU MAG",
      content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #00d4ff; margin-bottom: 20px;">📢 Announcement</h1>
        <p style="color: #333; line-height: 1.6;">Dear Readers,</p>
        <p style="color: #333; line-height: 1.6;">We have an exciting update to share with you...</p>
        <div style="margin: 30px 0; padding: 20px; background: #e8f4ff; border-left: 4px solid #00d4ff; border-radius: 4px;">
          <p style="color: #333; margin: 0; line-height: 1.6;"><strong>Key points:</strong></p>
          <ul style="color: #555; line-height: 1.8; margin-top: 10px;">
            <li>Point 1</li>
            <li>Point 2</li>
            <li>Point 3</li>
          </ul>
        </div>
        <p style="color: #333; line-height: 1.6;">Thank you for being part of our community!</p>
      </div>`
    }
  ];

  useEffect(() => {
    fetchSubscriptions();
    fetchCampaigns();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscriptions" as any)
        .select("*")
        .eq("status", "active")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscriptions((data as any) || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_campaigns" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns((data as any) || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const exportSubscriptions = () => {
    const csvContent = [
      "Email,Subscribed Date",
      ...subscriptions.map(sub => `${sub.email},${sub.subscribed_at}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendNewsletter = async () => {
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedContent = sanitizeInput(content);
    const sanitizedTitle = sanitizeInput(campaignTitle || sanitizedSubject);

    if (!sanitizedSubject.trim() || !sanitizedContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter both subject and content",
        variant: "destructive",
      });
      return;
    }

    if (sanitizedSubject.length > 255) {
      toast({
        title: "Error",
        description: "Subject line is too long (max 255 characters)",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Send newsletter to ${subscriptions.length} subscribers?`)) return;

    setSending(true);
    try {
      // Save campaign first
      const { data: { user } } = await supabase.auth.getUser();
      const { data: campaign, error: campaignError } = await supabase
        .from("newsletter_campaigns" as any)
        .insert({
          title: sanitizedTitle,
          subject: sanitizedSubject,
          content: sanitizedContent,
          template_name: selectedTemplate || null,
          status: 'sending',
          recipients_count: subscriptions.length,
          created_by: user?.id
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Send newsletter
      const { error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject: sanitizedSubject,
          content: sanitizedContent,
        },
      });

      if (error) throw error;

      // Update campaign status
      if (campaign) {
        await supabase
          .from("newsletter_campaigns" as any)
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', (campaign as any).id);
      }

      toast({
        title: "Newsletter Sent",
        description: `Newsletter sent to ${subscriptions.length} subscribers`,
      });
      
      setSubject("");
      setContent("");
      setCampaignTitle("");
      setSelectedTemplate("");
      fetchCampaigns();
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setSelectedTemplate(templateName);
      setSubject(template.subject);
      setContent(template.content);
      setCampaignTitle(template.name);
    }
  };

  const deactivateSubscription = async (id: string) => {
    if (!confirm("Deactivate this subscriber? They can be reactivated later.")) return;
    
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions" as any)
        .update({ 
          status: "inactive"
        })
        .eq("id", id);

      if (error) throw error;

      fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscriber deactivated successfully",
      });
    } catch (error) {
      console.error("Error deactivating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate subscription",
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("newsletter_campaigns" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchCampaigns();
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const addManualSubscription = async (email: string) => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existing) {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("subscriptions")
        .insert([{ email: email.toLowerCase() }]);

      if (error) throw error;

      fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscription added successfully",
      });
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast({
        title: "Error",
        description: "Failed to add subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(sub => 
                new Date(sub.subscribed_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="h-5 w-5" />
                Compose Newsletter Campaign
              </CardTitle>
              <CardDescription>
                Create a new email campaign for your {subscriptions.length} active subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Template</label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipients</label>
                  <Input value={`${subscriptions.length} active subscribers`} disabled />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Title</label>
                <Input
                  placeholder="Internal campaign name"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Subject</label>
                <Input
                  placeholder="Subject line for your email"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Content</label>
                <Textarea
                  placeholder="Write your email content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendNewsletter} disabled={sending} size="lg">
                  <SendIcon className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : `Send Campaign`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Email Campaigns
                  </CardTitle>
                  <CardDescription>
                    View and manage your newsletter campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No campaigns sent yet
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{campaign.title}</h3>
                            <Badge 
                              variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Subject: {campaign.subject}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Created: {format(new Date(campaign.created_at), 'MMM dd, yyyy')}</span>
                            {campaign.sent_at && (
                              <span>Sent: {format(new Date(campaign.sent_at), 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewCampaign(campaign)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Newsletter Subscribers</CardTitle>
                  <CardDescription>
                    Manage your newsletter subscriber list
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={exportSubscriptions}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Manual Subscription */}
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Add Manual Subscription</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addManualSubscription(newEmail)}
                  />
                  <Button 
                    onClick={() => {
                      addManualSubscription(newEmail);
                      setNewEmail("");
                    }}
                    disabled={!newEmail.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8">Loading subscribers...</div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">No subscribers found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{subscription.email}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(subscription.subscribed_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deactivateSubscription(subscription.id)}
                          >
                            Deactivate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Campaign Dialog */}
      <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewCampaign?.title}</DialogTitle>
            <DialogDescription>
              Campaign details and content preview
            </DialogDescription>
          </DialogHeader>
          {viewCampaign && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Subject:</h4>
                <p className="text-sm text-muted-foreground">{viewCampaign.subject}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Recipients:</h4>
                <p className="text-sm text-muted-foreground">{viewCampaign.recipients_count} subscribers</p>
              </div>
              {viewCampaign.template_name && (
                <div>
                  <h4 className="font-semibold mb-1">Template:</h4>
                  <p className="text-sm text-muted-foreground">{viewCampaign.template_name}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Content Preview:</h4>
                <div 
                  className="border rounded-lg p-4 bg-muted/50"
                  dangerouslySetInnerHTML={{ __html: viewCampaign.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterManager;
