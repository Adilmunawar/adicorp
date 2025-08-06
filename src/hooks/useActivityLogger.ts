
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
        ip_address: 'client-side',
        user_name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User'
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
    const actionMap = { create: 'added', update: 'updated', delete: 'removed' };
    
    await logActivity({
      actionType: `employee_${action}`,
      description: `Employee ${employeeName} was ${actionMap[action]}`,
      details: { 
        employee_name: employeeName, 
        action_performed: actionMap[action],
        ...details 
      },
      priority: priorityMap[action] as 'high' | 'medium' | 'low'
    });
  };

  const logAttendanceActivity = async (action: 'save' | 'bulk_update', details?: any) => {
    const descriptions = {
      save: 'Attendance data saved successfully',
      bulk_update: 'Bulk attendance update completed'
    };

    await logActivity({
      actionType: `attendance_${action}`,
      description: descriptions[action],
      details: {
        action_type: action,
        timestamp: new Date().toISOString(),
        ...details
      },
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
      details: { 
        security_action: true,
        change_time: new Date().toISOString()
      },
      priority: 'high'
    });
  };

  const logBackupActivity = async (type: 'create' | 'restore', details?: any) => {
    const descriptions = {
      create: 'System backup created successfully',
      restore: 'System restore operation performed'
    };

    await logActivity({
      actionType: `system_${type === 'create' ? 'backup' : 'restore'}`,
      description: descriptions[type],
      details: {
        backup_type: type,
        ...details
      },
      priority: 'high'
    });
  };

  return { 
    logActivity, 
    logEmployeeActivity, 
    logAttendanceActivity, 
    logSettingsActivity,
    logPasswordChange,
    logBackupActivity
  };
};
