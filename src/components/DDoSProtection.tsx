import { useEffect } from "react";
import { useDDoSProtection } from "@/hooks/useDDoSProtection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface DDoSProtectionProps {
  children: React.ReactNode;
}

export const DDoSProtection = ({ children }: DDoSProtectionProps) => {
  const { isBlocked, requestCount, logRequest } = useDDoSProtection({
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    suspiciousThreshold: 40,
    blockDuration: 30
  });

  useEffect(() => {
    // Log this page request
    logRequest();
  }, []);

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Access Temporarily Blocked</strong>
              <br />
              Too many requests detected. Please wait 30 minutes before trying again.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Security Protection Active</h1>
            <p className="text-muted-foreground">
              Our DDoS protection system has temporarily blocked your access to protect the site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if approaching limits
  if (requestCount > 40) {
    return (
      <div>
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            High request frequency detected. Please slow down to avoid being blocked.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};