import { useState, useEffect } from "react";

interface DDoSProtectionOptions {
  maxRequestsPerMinute?: number;
  suspiciousThreshold?: number;
}

export const useDDoSProtection = (options: DDoSProtectionOptions = {}) => {
  const {
    maxRequestsPerMinute = 60,
    suspiciousThreshold = 40
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    checkBlockStatus();
    
    // Monitor request frequency
    const interval = setInterval(() => {
      monitorRequestFrequency();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkBlockStatus = () => {
    try {
      const blockData = localStorage.getItem('ddos_block');
      if (blockData) {
        const { blockedUntil } = JSON.parse(blockData);
        if (new Date(blockedUntil) > new Date()) {
          setIsBlocked(true);
          // Auto-unblock when time expires
          const unblockTime = new Date(blockedUntil).getTime();
          const now = Date.now();
          setTimeout(() => {
            setIsBlocked(false);
            localStorage.removeItem('ddos_block');
          }, unblockTime - now);
        } else {
          localStorage.removeItem('ddos_block');
        }
      }
    } catch (error) {
      // Ignore errors
    }
  };

  const monitorRequestFrequency = () => {
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

  const logRequest = () => {
    if (isBlocked) return false;

    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem('request_log') || '[]');
    requests.push(now);
    localStorage.setItem('request_log', JSON.stringify(requests));

    // Check thresholds
    const lastMinuteRequests = requests.filter((time: number) => now - time < 60000);

    if (lastMinuteRequests.length > maxRequestsPerMinute) {
      blockClient();
      return false;
    }

    return true;
  };

  const blockClient = () => {
    try {
      const blockedUntil = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutes
      localStorage.setItem('ddos_block', JSON.stringify({
        blockedUntil,
        reason: 'Rate limit exceeded'
      }));

      setIsBlocked(true);
      
      // Auto-unblock after 30 minutes
      setTimeout(() => {
        setIsBlocked(false);
        localStorage.removeItem('ddos_block');
      }, 30 * 60000);

    } catch (error) {
      console.error('Failed to block client:', error);
    }
  };

  return {
    isBlocked,
    requestCount,
    logRequest,
    checkBlockStatus
  };
};