import { useState, useEffect } from "react";

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

  const checkBlockStatus = () => {
    // Check localStorage for block status
    const blockData = localStorage.getItem('ddos_block');
    if (blockData) {
      const { blockedUntil } = JSON.parse(blockData);
      const now = Date.now();
      
      if (now < blockedUntil) {
        setIsBlocked(true);
        // Auto-unblock when time expires
        setTimeout(() => {
          setIsBlocked(false);
          localStorage.removeItem('ddos_block');
        }, blockedUntil - now);
      } else {
        // Block has expired
        localStorage.removeItem('ddos_block');
      }
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

  const blockIP = () => {
    try {
      const blockedUntil = Date.now() + blockDuration * 60000;
      
      // Store block status in localStorage
      localStorage.setItem('ddos_block', JSON.stringify({
        blockedUntil,
        reason: 'Rate limit exceeded'
      }));

      setIsBlocked(true);
      
      // Auto-unblock after duration
      setTimeout(() => {
        setIsBlocked(false);
        localStorage.removeItem('ddos_block');
      }, blockDuration * 60000);

    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const reportSuspiciousActivity = () => {
    // Log suspicious activity to console for now
    console.warn('Suspicious activity detected:', {
      requests_per_minute: requestCount,
      timestamp: new Date().toISOString()
    });
  };

  return {
    isBlocked,
    requestCount,
    logRequest,
    checkBlockStatus
  };
};