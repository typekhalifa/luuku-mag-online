
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
import { MailIcon, SendIcon, UsersIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import NewsletterTemplates from "./NewsletterTemplates";
import { formatDistanceToNow } from "date-fns";

interface Subscription {
  id: string;
  email: string;
  subscribed_at: string;
  status: string;
  unsubscribed_at?: string;
}

const NewsletterManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
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
      const { error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject: sanitizedSubject,
          content: sanitizedContent,
        },
      });

      if (error) throw error;

      toast({
        title: "Newsletter Sent",
        description: `Newsletter sent to ${subscriptions.length} subscribers`,
      });
      
      setSubject("");
      setContent("");
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

  const useTemplate = (templateSubject: string, templateContent: string) => {
    setSubject(templateSubject);
    setContent(templateContent);
    setShowTemplates(false);
    toast({
      title: "Template Loaded",
      description: "You can now customize the template before sending",
    });
  };

  const removeSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to unsubscribe this email? They can resubscribe later.")) return;
    
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions" as any)
        .update({ 
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscriber unsubscribed successfully",
      });
    } catch (error) {
      console.error("Error removing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to remove subscription",
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

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose Newsletter</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscribers">Manage Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
              <CardDescription>
                Create and send newsletters to your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Enter newsletter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content (HTML supported)</label>
                <Textarea
                  placeholder="Enter newsletter content (HTML supported)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendNewsletter} disabled={sending}>
                  <SendIcon className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : `Send to ${subscriptions.filter(s => s.status === 'active').length} subscribers`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Templates</CardTitle>
              <CardDescription>
                Choose a pre-designed template to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsletterTemplates onSelectTemplate={useTemplate} />
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
                            onClick={() => removeSubscription(subscription.id)}
                          >
                            Remove
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
    </div>
  );
};

export default NewsletterManager;
