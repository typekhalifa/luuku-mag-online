
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const Users: React.FC = () => {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          Note: This is a placeholder page. User management functionality will be implemented in a future update.
        </p>
      </div>

      <Table>
        <TableCaption>User management (placeholder)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              User management will be implemented in a future update
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default Users;
