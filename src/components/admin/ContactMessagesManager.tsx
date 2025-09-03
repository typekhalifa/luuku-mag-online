import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MailIcon, TrashIcon, ReplyIcon, EyeIcon, EyeOffIcon, FilterIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface ContactMessage {
  id: string;
  name: string | null;
  email: string;
  message: string;
  sent_at: string;
  is_read: boolean | null;
  read_at: string | null;
  read_by: string | null;
}

const ContactMessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { user } = useAuth();

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
      setMessages((data as ContactMessage[]) || []);
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

  const markAsRead = async (messageId: string, isRead: boolean) => {
    try {
      const updateData: Record<string, any> = {
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null,
        read_by: isRead ? user?.id : null,
      };

      const { error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_read: isRead, read_at: isRead ? new Date().toISOString() : null, read_by: isRead ? user?.id : null }
          : msg
      ));

      toast({
        title: "Success",
        description: `Message marked as ${isRead ? 'read' : 'unread'}`,
      });
    } catch (error) {
      console.error("Error updating message status:", error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const viewFullMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id, true);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === "read") return message.is_read;
    if (filter === "unread") return !message.is_read;
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.is_read).length;

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
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={(value: "all" | "read" | "unread") => setFilter(value)}>
              <SelectTrigger className="w-32">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({messages.length})</SelectItem>
                <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
                <SelectItem value="read">Read ({messages.length - unreadCount})</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Badge variant="secondary">
                Total: {messages.length}
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === "all" ? "No contact messages found" : `No ${filter} messages found`}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow 
                    key={message.id} 
                    className={message.is_read ? "opacity-60" : "bg-muted/30"}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {message.is_read ? (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOffIcon className="h-4 w-4 text-primary" />
                        )}
                        <Badge variant={message.is_read ? "secondary" : "default"}>
                          {message.is_read ? "Read" : "Unread"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={message.is_read ? "font-normal" : "font-semibold"}>
                      {message.name || "Anonymous"}
                    </TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={message.message}>
                        {message.message.length > 40
                          ? `${message.message.substring(0, 40)}...`
                          : message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewFullMessage(message)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Message from {message.name || "Anonymous"}</DialogTitle>
                              <DialogDescription>
                                Received {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })} from {message.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Full Message:</h4>
                                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                  {message.message}
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => replyToMessage(message.email, message.name)}
                                  className="flex-1"
                                >
                                  <ReplyIcon className="h-4 w-4 mr-2" />
                                  Reply via Email
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => markAsRead(message.id, !message.is_read)}
                                >
                                  {message.is_read ? (
                                    <>
                                      <EyeOffIcon className="h-4 w-4 mr-2" />
                                      Mark Unread
                                    </>
                                  ) : (
                                    <>
                                      <EyeIcon className="h-4 w-4 mr-2" />
                                      Mark Read
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(message.id, !message.is_read)}
                        >
                          {message.is_read ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactMessagesManager;