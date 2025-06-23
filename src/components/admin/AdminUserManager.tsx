
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { PlusIcon, UserIcon, ShieldIcon, CrownIcon } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "editor" | "user";
}

const AdminUserManager: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor">("editor");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("role", { ascending: true });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteAdmin = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real application, you would send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Admin invitation sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Error inviting admin:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "editor" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUserRoles(prev => prev.map(ur => 
        ur.user_id === userId ? { ...ur, role: newRole } : ur
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const removeUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setUserRoles(prev => prev.filter(ur => ur.user_id !== userId));
      toast({
        title: "Success",
        description: "User removed successfully",
      });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <CrownIcon className="h-4 w-4" />;
      case "editor":
        return <ShieldIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "editor":
        return "default";
      default:
        return "secondary";
    }
  };

  const adminCount = userRoles.filter(ur => ur.role === "admin").length;
  const editorCount = userRoles.filter(ur => ur.role === "editor").length;
  const userCount = userRoles.filter(ur => ur.role === "user").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CrownIcon className="h-4 w-4" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              Editors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage admin and editor users
              </CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Invite Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Admin</DialogTitle>
                  <DialogDescription>
                    Send an invitation to add a new admin or editor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      placeholder="Enter email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select value={inviteRole} onValueChange={(value: "admin" | "editor") => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={inviteAdmin} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : userRoles.length === 0 ? (
            <div className="text-center py-8">No admin users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell className="font-mono text-sm">
                      {userRole.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRole.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(userRole.role)}
                        {userRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={userRole.role}
                          onValueChange={(value: "admin" | "editor" | "user") => 
                            updateUserRole(userRole.user_id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUser(userRole.user_id)}
                        >
                          Remove
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
    </div>
  );
};

export default AdminUserManager;
