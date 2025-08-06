
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LogActivityParams {
  actionType: string;
  description: string;
  details?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low';
}

export const useActivityLogger = () => {
  const { user, userProfile } = useAuth();

  const logActivity = async ({ 
    actionType, 
    description, 
    details = {}, 
    priority = 'medium' 
  }: LogActivityParams) => {
    if (!user || !userProfile?.company_id) {
      console.warn('Cannot log activity: User or company not found');
      return;
    }

    try {
      const activityDetails = {
        ...details,
        priority,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'client-side' // Could be enhanced with actual IP detection
      };

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action_type: actionType,
          description,
          details: activityDetails,
          user_id: user.id,
          company_id: userProfile.company_id
        });

      if (error) {
        console.error('Failed to log activity:', error);
      } else {
        console.log(`Activity logged: ${actionType} - ${description}`);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  };

  // Enhanced logging functions for specific activities
  const logEmployeeActivity = async (action: 'create' | 'update' | 'delete', employeeName: string, details?: any) => {
    const priorityMap = { create: 'medium', update: 'medium', delete: 'high' };
    await logActivity({
      actionType: `employee_${action}`,
      description: `Employee ${employeeName} was ${action === 'create' ? 'added' : action === 'update' ? 'updated' : 'removed'}`,
      details: { employee_name: employeeName, ...details },
      priority: priorityMap[action] as 'high' | 'medium' | 'low'
    });
  };

  const logAttendanceActivity = async (action: 'save' | 'bulk_update', details?: any) => {
    await logActivity({
      actionType: `attendance_${action}`,
      description: `Attendance ${action === 'save' ? 'saved' : 'bulk updated'}`,
      details,
      priority: 'low'
    });
  };

  const logSettingsActivity = async (settingType: string, description: string, details?: any) => {
    await logActivity({
      actionType: 'settings_update',
      description: `${settingType} settings updated: ${description}`,
      details: { setting_type: settingType, ...details },
      priority: 'medium'
    });
  };

  const logPasswordChange = async () => {
    await logActivity({
      actionType: 'password_change',
      description: 'User changed their password',
      details: { security_action: true },
      priority: 'high'
    });
  };

  return { 
    logActivity, 
    logEmployeeActivity, 
    logAttendanceActivity, 
    logSettingsActivity,
    logPasswordChange
  };
};
