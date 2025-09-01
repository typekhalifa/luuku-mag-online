import { supabase } from "@/integrations/supabase/client";

interface SecurityEventDetails {
  action?: string;
  resource?: string;
  userAgent?: string;
  sessionId?: string;
  [key: string]: any;
}

export class SecurityEventLogger {
  static async logEvent(
    eventType: string,
    details?: SecurityEventDetails
  ): Promise<void> {
    try {
      // Get client IP and user agent from browser
      const userAgent = navigator.userAgent;
      
      // Call the database function to log the event
      const { error } = await supabase.rpc('log_security_event', {
        _event_type: eventType,
        _user_agent: userAgent,
        _details: details || {}
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Common security events
  static async logUnauthorizedAccess(resource: string, details?: any) {
    await this.logEvent('unauthorized_access', {
      resource,
      ...details
    });
  }

  static async logAdminAction(action: string, details?: any) {
    await this.logEvent('admin_action', {
      action,
      ...details
    });
  }

  static async logLoginAttempt(success: boolean, details?: any) {
    await this.logEvent('login_attempt', {
      success,
      ...details
    });
  }

  static async logDataAccess(resource: string, action: string, details?: any) {
    await this.logEvent('data_access', {
      resource,
      action,
      ...details
    });
  }

  static async logSecurityViolation(violation: string, details?: any) {
    await this.logEvent('security_violation', {
      violation,
      ...details
    });
  }
}