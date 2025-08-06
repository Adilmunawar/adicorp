
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { 
  Clock, 
  Users, 
  Download, 
  Upload, 
  Settings, 
  Calendar, 
  Shield, 
  UserPlus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Info,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  details: any;
  user_id: string;
  company_id: string;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const actionIcons = {
  'employee_import': Upload,
  'employee_export': Download,
  'employee_create': UserPlus,
  'employee_update': Edit,
  'employee_delete': Trash2,
  'settings_update': Settings,
  'working_days_update': Calendar,
  'event_create': Shield,
  'event_update': Shield,
  'event_delete': Shield,
  'attendance_bulk_update': RefreshCw,
  'attendance_save': CheckCircle,
  'company_setup': Settings,
  'system_backup': Download,
  'password_change': AlertCircle,
  'default': Clock
};

const actionColors = {
  'employee_import': 'bg-green-500',
  'employee_export': 'bg-blue-500',
  'employee_create': 'bg-emerald-500',
  'employee_update': 'bg-yellow-500',
  'employee_delete': 'bg-red-500',
  'settings_update': 'bg-purple-500',
  'working_days_update': 'bg-orange-500',
  'event_create': 'bg-cyan-500',
  'event_update': 'bg-indigo-500',
  'event_delete': 'bg-pink-500',
  'attendance_bulk_update': 'bg-teal-500',
  'attendance_save': 'bg-green-600',
  'company_setup': 'bg-violet-500',
  'system_backup': 'bg-gray-500',
  'password_change': 'bg-red-600',
  'default': 'bg-slate-500'
};

const getPriority = (actionType: string, details: any) => {
  if (details?.priority) {
    return details.priority;
  }
  
  switch (actionType) {
    case 'password_change':
    case 'employee_delete':
    case 'system_backup':
      return 'high';
    case 'employee_create':
    case 'employee_update':
    case 'settings_update':
    case 'working_days_update':
      return 'medium';
    case 'attendance_save':
    case 'attendance_bulk_update':
    case 'event_create':
    case 'event_update':
      return 'low';
    default:
      return 'medium';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return AlertCircle;
    case 'medium':
      return Info;
    case 'low':
      return CheckCircle;
    default:
      return Info;
  }
};

export default function TimelineLogsList() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 20;

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['timeline-logs', userProfile?.company_id, searchTerm, filterType, page],
    queryFn: async () => {
      if (!userProfile?.company_id) return [];

      let query = supabase
        .from('activity_logs')
        .select(`
          id,
          action_type,
          description,
          details,
          user_id,
          company_id,
          created_at,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(log => ({
        ...log,
        user_name: log.profiles ? 
          `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || 'Unknown User'
          : 'System'
      })) || [];
    },
    enabled: !!userProfile?.company_id,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch the timeline logs
      await queryClient.invalidateQueries({ queryKey: ['timeline-logs'] });
      await refetch();
      toast.success("Timeline logs refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing timeline logs:", error);
      toast.error("Failed to refresh timeline logs");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    const IconComponent = actionIcons[actionType as keyof typeof actionIcons] || actionIcons.default;
    return IconComponent;
  };

  const getActionColor = (actionType: string) => {
    return actionColors[actionType as keyof typeof actionColors] || actionColors.default;
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">Error loading timeline logs</p>
          <Button 
            onClick={handleRefresh} 
            className="mt-4 bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Activity Timeline</h2>
          <p className="text-white/70">
            Track all important changes and activities in your system with detailed timestamps
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-adicorp-dark border-white/20 text-white"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-adicorp-dark border-white/20 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="password_change">Password Changes</SelectItem>
                  <SelectItem value="employee_import">Employee Import</SelectItem>
                  <SelectItem value="employee_export">Employee Export</SelectItem>
                  <SelectItem value="employee_create">Employee Created</SelectItem>
                  <SelectItem value="employee_update">Employee Updated</SelectItem>
                  <SelectItem value="employee_delete">Employee Deleted</SelectItem>
                  <SelectItem value="attendance_save">Attendance Saved</SelectItem>
                  <SelectItem value="settings_update">Settings Changed</SelectItem>
                  <SelectItem value="working_days_update">Working Days Updated</SelectItem>
                  <SelectItem value="event_create">Event Created</SelectItem>
                  <SelectItem value="event_update">Event Updated</SelectItem>
                  <SelectItem value="event_delete">Event Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            const IconComponent = getActionIcon(log.action_type);
            const actionColor = getActionColor(log.action_type);
            const priority = getPriority(log.action_type, log.details);
            const priorityColor = getPriorityColor(priority);
            const PriorityIcon = getPriorityIcon(priority);
            
            return (
              <Card key={log.id} className="glass-card hover:bg-white/5 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${actionColor} flex-shrink-0`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                              {formatActionType(log.action_type)}
                            </Badge>
                            <Badge className={`text-xs ${priorityColor}`}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priority.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-white/60">
                              by {log.user_name}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-2">{log.description}</p>
                          
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="text-sm text-white/70 bg-adicorp-dark/30 rounded p-2 mt-2">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1">
                                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span className="text-white/90">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-white/60 flex-shrink-0">
                          <div>{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
                          <div>{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
              <p className="text-white/60">
                {searchTerm || filterType !== 'all' 
                  ? 'No activities match your current filters.'
                  : 'System activities will appear here as they occur.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {logs && logs.length === ITEMS_PER_PAGE && (
        <div className="flex justify-center">
          <Button
            onClick={() => setPage(page + 1)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
