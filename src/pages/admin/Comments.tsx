
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Flag, Search, Filter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  article_id: string;
  author_name: string | null;
  content: string;
  posted_at: string;
  status: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  flag_reason: string | null;
  is_spam: boolean | null;
  likes_count: number | null;
  dislikes_count: number | null;
  articles?: { title: string };
}

interface CommentReport {
  id: string;
  comment_id: string;
  reporter_name: string | null;
  reporter_email: string | null;
  reason: string;
  description: string | null;
  created_at: string;
  comments?: Comment;
}

const CommentsAdmin: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  useEffect(() => {
    fetchComments();
    fetchReports();
  }, [filter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("comments")
        .select(`
          *,
          articles (title)
        `)
        .order("posted_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("comment_reports")
        .select(`
          *,
          comments (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const moderateComment = async (commentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({
          status,
          moderated_at: new Date().toISOString(),
          // In a real app, you'd get the current admin user ID
          moderated_by: null,
        })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Comment ${status}`,
      });

      fetchComments();
    } catch (error) {
      console.error("Error moderating comment:", error);
      toast({
        title: "Error",
        description: "Failed to moderate comment",
        variant: "destructive",
      });
    }
  };

  const bulkModerate = async (status: string) => {
    if (selectedComments.length === 0) return;

    try {
      const { error } = await supabase
        .from("comments")
        .update({
          status,
          moderated_at: new Date().toISOString(),
        })
        .in("id", selectedComments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedComments.length} comments ${status}`,
      });

      setSelectedComments([]);
      fetchComments();
    } catch (error) {
      console.error("Error bulk moderating:", error);
      toast({
        title: "Error",
        description: "Failed to moderate comments",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500">Flagged</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.articles?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = comments.filter(c => c.status === 'pending' || !c.status).length;
  const flaggedCount = comments.filter(c => c.status === 'flagged').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comments Management</h1>
          <p className="text-muted-foreground">Moderate comments and manage user reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{flaggedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{reports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Management */}
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Review and moderate user comments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Search size={16} />
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <Filter size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Comments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedComments.length > 0 && (
              <div className="flex gap-2 mb-4 p-3 bg-muted rounded">
                <span className="text-sm">
                  {selectedComments.length} comments selected
                </span>
                <Button size="sm" onClick={() => bulkModerate('approved')}>
                  <CheckCircle size={14} className="mr-1" />
                  Approve All
                </Button>
                <Button size="sm" variant="destructive" onClick={() => bulkModerate('rejected')}>
                  <XCircle size={14} className="mr-1" />
                  Reject All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedComments([])}>
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Comments Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComments(filteredComments.map(c => c.id));
                          } else {
                            setSelectedComments([]);
                          }
                        }}
                        checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                      />
                    </TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading comments...
                      </TableCell>
                    </TableRow>
                  ) : filteredComments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No comments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedComments.includes(comment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedComments([...selectedComments, comment.id]);
                              } else {
                                setSelectedComments(selectedComments.filter(id => id !== comment.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {comment.author_name || "Anonymous"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {comment.content}
                          </div>
                          {comment.flag_reason && (
                            <div className="text-xs text-red-600 mt-1">
                              Flag: {comment.flag_reason}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>👍 {comment.likes_count || 0}</span>
                            <span>👎 {comment.dislikes_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {comment.articles?.title || "Unknown Article"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(comment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(comment.posted_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {comment.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moderateComment(comment.id, 'approved')}
                              >
                                <CheckCircle size={14} />
                              </Button>
                            )}
                            {comment.status !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moderateComment(comment.id, 'rejected')}
                              >
                                <XCircle size={14} />
                              </Button>
                            )}
                            {comment.status !== 'flagged' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moderateComment(comment.id, 'flagged')}
                              >
                                <Flag size={14} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        {reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comment Reports</CardTitle>
              <CardDescription>User reports requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 10).map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="outline">{report.reason}</Badge>
                        <span className="text-sm text-muted-foreground ml-2">
                          by {report.reporter_name || "Anonymous"} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                    )}
                    {report.comments && (
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm"><strong>Reported comment:</strong></p>
                        <p className="text-sm">{report.comments.content}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => moderateComment(report.comments.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => moderateComment(report.comments.id, 'rejected')}>
                            Remove
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => moderateComment(report.comments.id, 'flagged')}>
                            Flag for Review
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommentsAdmin;
