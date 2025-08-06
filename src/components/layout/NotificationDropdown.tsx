
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Clock, User, Building2, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: recentLogs = [], isLoading } = useQuery({
    queryKey: ['recent-notifications', userProfile?.company_id],
    queryFn: async () => {
      if (!userProfile?.company_id) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;

      return data?.map(log => ({
        ...log,
        user_name: log.profiles ? 
          `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || 'Unknown User'
          : 'System'
      })) || [];
    },
    enabled: !!userProfile?.company_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadLogs = recentLogs.filter(log => !readNotifications.has(log.id));
  const unreadCount = unreadLogs.length > 9 ? 9 : unreadLogs.length;

  const markAsRead = useCallback((logId: string) => {
    setReadNotifications(prev => new Set([...prev, logId]));
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(recentLogs.map(log => log.id));
    setReadNotifications(allIds);
  }, [recentLogs]);

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'employee_import':
      case 'employee_export':
      case 'employee_create':
      case 'employee_update':
      case 'employee_delete':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'system_backup':
      case 'system_restore':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'password_change':
        return <Building2 className="h-4 w-4 text-red-500" />;
      case 'attendance_save':
      case 'attendance_bulk_update':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'settings_update':
      case 'working_days_update':
        return <Building2 className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityFromDetails = (details: any): string => {
    if (!details) return 'medium';
    
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return parsed.priority || 'medium';
      } catch {
        return 'medium';
      }
    }
    
    if (typeof details === 'object' && details !== null) {
      return details.priority || 'medium';
    }
    
    return 'medium';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="outline" size="icon" className="rounded-full border-white/10">
            <Bell size={18} />
          </Button>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Latest changes in your company</p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                <BellOff className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="divide-y">
              {recentLogs.map((log) => {
                const isRead = readNotifications.has(log.id);
                const priority = getPriorityFromDetails(log.details);
                
                return (
                  <div 
                    key={log.id} 
                    className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${!isRead ? 'bg-blue-500/5' : ''}`}
                    onClick={() => markAsRead(log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActionIcon(log.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatActionType(log.action_type)}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs px-1 py-0 ${getPriorityColor(priority)}`}>
                              {priority.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 line-clamp-2 ${!isRead ? 'font-medium text-foreground' : 'text-foreground'}`}>
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {log.user_name}
                        </p>
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-3"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {recentLogs.length > 0 && (
          <div className="p-3 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/timeline-logs';
              }}
            >
              View All Activity
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
