import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MailIcon, TrashIcon, ReplyIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
  id: string;
  name: string | null;
  email: string;
  message: string;
  sent_at: string;
}

const ContactMessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== id));
      toast({
        title: "Success",
        description: "Message deleted",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const replyToMessage = (email: string, name: string | null) => {
    const subject = `Re: Your message to our magazine`;
    const body = `Hello ${name || 'there'},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nThe Magazine Team`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="h-5 w-5" />
              Contact Messages
            </CardTitle>
            <CardDescription>
              View and manage contact form submissions
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {messages.length} total messages
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No contact messages found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">
                    {message.name || "Anonymous"}
                  </TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={message.message}>
                      {message.message.length > 50
                        ? `${message.message.substring(0, 50)}...`
                        : message.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => replyToMessage(message.email, message.name)}
                      >
                        <ReplyIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactMessagesManager;