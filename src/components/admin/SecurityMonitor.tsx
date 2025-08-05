import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Eye, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  ip_address?: string;
  details?: any;
}

export const SecurityMonitor = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    blockedAttempts: 0,
    flaggedComments: 0,
    reportedComments: 0,
    rateLimitHits: 0
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Get flagged comments
      const { data: flaggedComments } = await supabase
        .from('comments')
        .select('*')
        .eq('status', 'flagged')
        .order('posted_at', { ascending: false })
        .limit(10);

      // Get comment reports
      const { data: reports } = await supabase
        .from('comment_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get rate limit data
      const { data: rateLimits } = await supabase
        .from('rate_limits')
        .select('*')
        .gte('last_attempt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('last_attempt', { ascending: false });

      // Create security alerts from the data
      const securityAlerts: SecurityAlert[] = [];

      // Add flagged comment alerts
      flaggedComments?.forEach(comment => {
        securityAlerts.push({
          id: `comment-${comment.id}`,
          type: 'Content Moderation',
          severity: comment.is_spam ? 'high' : 'medium',
          message: `Comment flagged: ${comment.flag_reason}`,
          timestamp: comment.posted_at,
          details: { commentId: comment.id, content: comment.content.substring(0, 100) }
        });
      });

      // Add report alerts
      reports?.forEach(report => {
        securityAlerts.push({
          id: `report-${report.id}`,
          type: 'User Report',
          severity: 'medium',
          message: `Comment reported for: ${report.reason}`,
          timestamp: report.created_at,
          details: { reportId: report.id, reason: report.reason }
        });
      });

      // Add rate limit alerts
      const highActivityIPs = rateLimits?.reduce((acc: Record<string, number>, limit) => {
        const ip = limit.ip_address as string;
        if (!acc[ip]) acc[ip] = 0;
        acc[ip] += limit.attempt_count as number;
        return acc;
      }, {});

      Object.entries(highActivityIPs || {}).forEach(([ip, count]) => {
        if (count >= 10) {
          securityAlerts.push({
            id: `rate-${ip}`,
            type: 'Rate Limiting',
            severity: count >= 50 ? 'critical' : 'high',
            message: `High activity from IP: ${ip} (${count} attempts)`,
            timestamp: new Date().toISOString(),
            ip_address: ip,
            details: { attempts: count }
          });
        }
      });

      setAlerts(securityAlerts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

      // Update stats
      setStats({
        blockedAttempts: rateLimits?.reduce((sum, limit) => sum + limit.attempt_count, 0) || 0,
        flaggedComments: flaggedComments?.length || 0,
        reportedComments: reports?.length || 0,
        rateLimitHits: rateLimits?.length || 0
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error loading security data",
        description: "Unable to fetch security information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Comments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Reports</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportedComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rateLimitHits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Recent security events and threats detected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security alerts - your site is secure!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{alert.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                        {alert.ip_address && ` • IP: ${alert.ip_address}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={fetchSecurityData} 
              variant="outline" 
              className="w-full"
            >
              Refresh Security Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};