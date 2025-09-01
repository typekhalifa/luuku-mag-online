import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this area. Administrator privileges are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact your system administrator.
          </div>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};