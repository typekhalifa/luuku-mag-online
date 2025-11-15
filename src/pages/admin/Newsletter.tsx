import AdminLayout from "@/components/layout/AdminLayout";
import NewsletterManager from "@/components/admin/NewsletterManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailIcon } from "lucide-react";

const NewsletterPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="h-6 w-6" />
              Newsletter Management
            </CardTitle>
            <CardDescription>
              Manage subscribers and create email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsletterManager />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NewsletterPage;
