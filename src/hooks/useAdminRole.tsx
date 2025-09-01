import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface UseAdminRoleReturn {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: () => Promise<boolean>;
}

export const useAdminRole = (): UseAdminRoleReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return false;
      }

      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    checkAdminRole();
  }, [user, authLoading]);

  return {
    isAdmin,
    isLoading: isLoading || authLoading,
    checkAdminRole,
  };
};