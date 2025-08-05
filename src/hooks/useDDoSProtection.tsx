import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DDoSProtectionOptions {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  suspiciousThreshold?: number;
  blockDuration?: number; // minutes
}

export const useDDoSProtection = (options: DDoSProtectionOptions = {}) => {
  const {
    maxRequestsPerMinute = 60,
    maxRequestsPerHour = 1000,
    suspiciousThreshold = 100,
    blockDuration = 30
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Check if user is already blocked
    checkBlockStatus();
    
    // Monitor request frequency
    const interval = setInterval(() => {
      monitorRequestFrequency();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkBlockStatus = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      const { data } = await supabase
        .from('ddos_blocks')
        .select('*')
        .eq('ip_address', ip)
        .gt('blocked_until', new Date().toISOString())
        .single();

      if (data) {
        setIsBlocked(true);
        // Auto-unblock when time expires
        const unblockTime = new Date(data.blocked_until).getTime();
        const now = Date.now();
        if (unblockTime > now) {
          setTimeout(() => {
            setIsBlocked(false);
          }, unblockTime - now);
        }
      }
    } catch (error) {
      // User not blocked or error checking
    }
  };

  const monitorRequestFrequency = () => {
    // Simple client-side request counting
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem('request_log') || '[]');
    
    // Clean old requests (older than 1 hour)
    const recentRequests = requests.filter((time: number) => now - time < 3600000);
    
    // Count requests in last minute
    const lastMinuteRequests = recentRequests.filter((time: number) => now - time < 60000);
    
    setRequestCount(lastMinuteRequests.length);
    
    // Store cleaned requests
    localStorage.setItem('request_log', JSON.stringify(recentRequests));
  };

  const logRequest = async () => {
    if (isBlocked) return false;

    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem('request_log') || '[]');
    requests.push(now);
    localStorage.setItem('request_log', JSON.stringify(requests));

    // Check thresholds
    const lastMinuteRequests = requests.filter((time: number) => now - time < 60000);
    const lastHourRequests = requests.filter((time: number) => now - time < 3600000);

    if (lastMinuteRequests.length > maxRequestsPerMinute || 
        lastHourRequests.length > maxRequestsPerHour) {
      
      await blockIP();
      return false;
    }

    // Check for suspicious patterns
    if (lastMinuteRequests.length > suspiciousThreshold) {
      await reportSuspiciousActivity();
    }

    return true;
  };

  const blockIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      const blockedUntil = new Date(Date.now() + blockDuration * 60000).toISOString();

      await supabase
        .from('ddos_blocks')
        .upsert({
          ip_address: ip,
          blocked_until: blockedUntil,
          reason: 'Rate limit exceeded',
          created_at: new Date().toISOString()
        });

      setIsBlocked(true);
      
      // Auto-unblock after duration
      setTimeout(() => {
        setIsBlocked(false);
      }, blockDuration * 60000);

    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  };

  const reportSuspiciousActivity = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      await supabase
        .from('security_alerts')
        .insert({
          type: 'DDoS_ATTEMPT',
          severity: 'high',
          ip_address: ip,
          details: { requests_per_minute: requestCount },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to report suspicious activity:', error);
    }
  };

  return {
    isBlocked,
    requestCount,
    logRequest,
    checkBlockStatus
  };
};