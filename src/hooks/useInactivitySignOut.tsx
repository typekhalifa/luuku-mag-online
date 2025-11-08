import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

export const useInactivitySignOut = (timeoutMinutes: number = 5) => {
  const { signOut, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning at 4 minutes (1 minute before sign out)
    warningTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Inactivity Warning",
        description: "You will be signed out in 1 minute due to inactivity.",
        variant: "destructive",
      });
    }, (timeoutMinutes - 1) * 60 * 1000);

    // Set sign out timer
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: "Signed Out",
        description: "You have been signed out due to inactivity.",
        variant: "destructive",
      });
      await signOut();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, timeoutMinutes]);
};
