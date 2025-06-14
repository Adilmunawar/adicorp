
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, User, Building2 } from "lucide-react";
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
  const { userProfile } = useAuth();

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
        .limit(10);

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

  const unreadCount = recentLogs.length > 5 ? 5 : recentLogs.length;

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'employee_import':
      case 'employee_export':
      case 'employee_create':
      case 'employee_update':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'configuration_update':
      case 'working_days_update':
        return <Building2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Latest changes in your company</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
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
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getActionIcon(log.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatActionType(log.action_type)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1 line-clamp-2">
                        {log.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {log.user_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
