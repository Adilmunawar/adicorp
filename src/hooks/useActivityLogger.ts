
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LogActivityParams {
  actionType: string;
  description: string;
  details?: Record<string, any>;
}

export const useActivityLogger = () => {
  const { user, userProfile } = useAuth();

  const logActivity = async ({ actionType, description, details = {} }: LogActivityParams) => {
    if (!user || !userProfile?.company_id) {
      console.warn('Cannot log activity: User or company not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action_type: actionType,
          description,
          details,
          user_id: user.id,
          company_id: userProfile.company_id
        });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  };

  return { logActivity };
};
