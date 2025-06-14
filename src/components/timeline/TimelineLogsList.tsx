
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Filter
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  details: any;
  user_id: string;
  company_id: string;
  created_at: string;
  user_email?: string;
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
  'company_setup': Settings,
  'system_backup': Download,
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
  'company_setup': 'bg-violet-500',
  'system_backup': 'bg-gray-500',
  'default': 'bg-slate-500'
};

export default function TimelineLogsList() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const { data: logs, isLoading, error } = useQuery({
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
          profiles:user_id (
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

      return data.map(log => ({
        ...log,
        user_email: log.profiles ? 
          `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || 'Unknown User'
          : 'System'
      }));
    },
    enabled: !!userProfile?.company_id,
  });

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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                  <SelectItem value="employee_import">Employee Import</SelectItem>
                  <SelectItem value="employee_export">Employee Export</SelectItem>
                  <SelectItem value="employee_create">Employee Created</SelectItem>
                  <SelectItem value="employee_update">Employee Updated</SelectItem>
                  <SelectItem value="employee_delete">Employee Deleted</SelectItem>
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
                            <span className="text-sm text-white/60">
                              by {log.user_email}
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
