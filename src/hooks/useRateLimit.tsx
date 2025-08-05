import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface UseRateLimitOptions {
  action: string;
  maxAttempts?: number;
  windowMinutes?: number;
}

export const useRateLimit = ({ action, maxAttempts = 5, windowMinutes = 60 }: UseRateLimitOptions) => {
  const [isLimited, setIsLimited] = useState(false);

  const checkRateLimit = async (): Promise<boolean> => {
    try {
      // Get user's IP address (simplified - in production you'd get this from server)
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      const { data, error } = await supabase.rpc('check_rate_limit', {
        _ip_address: ip,
        _action_type: action,
        _max_attempts: maxAttempts,
        _window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error to avoid blocking legitimate users
      }

      if (!data) {
        setIsLimited(true);
        toast({
          title: "Rate limit exceeded",
          description: `Too many attempts. Please wait ${windowMinutes} minutes before trying again.`,
          variant: "destructive",
        });
        return false;
      }

      setIsLimited(false);
      return true;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow on network error
    }
  };

  return {
    checkRateLimit,
    isLimited,
  };
};