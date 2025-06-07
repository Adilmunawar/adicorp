import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Zap, Calendar as CalendarIcon } from "lucide-react";
import { EmployeeRow } from "@/types/supabase";
import { dataCache, getCacheKey } from "@/utils/cache";
import { shouldShowAttendance, getEventsForDate } from "@/utils/workingDays";
import { EventRow } from "@/types/events";

interface AttendanceRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: string;
}

export default function AttendanceTable() {
  const [date, setDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [showAttendance, setShowAttendance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // Memoized employees cache key
  const employeesCacheKey = useMemo(() => 
    getCacheKey('employees', userProfile?.company_id || ''), 
    [userProfile?.company_id]
  );

  const fetchEmployees = async () => {
    try {
      if (!userProfile?.company_id) return;
      
      // Check cache first
      const cachedEmployees = dataCache.get<EmployeeRow[]>(employeesCacheKey);
      if (cachedEmployees) {
        console.log("AttendanceTable - Using cached employees");
        setEmployees(cachedEmployees);
        return;
      }
      
      console.log("AttendanceTable - Fetching employees from DB");
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      
      const employeeData = data || [];
      setEmployees(employeeData);
      
      // Cache for 10 minutes
      dataCache.set(employeesCacheKey, employeeData, 10 * 60 * 1000);
      console.log("AttendanceTable - Cached employees:", employeeData.length);
    } catch (error) {
      console.error("AttendanceTable - Error fetching employees:", error);
      toast({
        title: "Error fetching employees",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkDateStatus = async (selectedDate: Date) => {
    if (!userProfile?.company_id) return;
    
    const shouldShow = await shouldShowAttendance(selectedDate, userProfile.company_id);
    const dayEvents = await getEventsForDate(selectedDate, userProfile.company_id);
    
    setShowAttendance(shouldShow);
    setEvents(dayEvents);
  };

  const fetchAttendance = async (selectedDate: Date, useCache = true) => {
    try {
      if (!userProfile?.company_id || employees.length === 0) return;
      
      setDateLoading(true);
      
      // Check if this date should show attendance
      await checkDateStatus(selectedDate);
      
      const dateString = selectedDate.toISOString().split('T')[0];
      const attendanceCacheKey = getCacheKey('attendance', userProfile.company_id, dateString);
      
      // Check cache first for instant loading
      if (useCache) {
        const cachedAttendance = dataCache.get<AttendanceRecord[]>(attendanceCacheKey);
        if (cachedAttendance) {
          console.log("AttendanceTable - Using cached attendance for", dateString);
          setAttendanceData(cachedAttendance);
          setDateLoading(false);
          return;
        }
      }
      
      console.log("AttendanceTable - Fetching attendance for date:", dateString);
      
      const employeeIds = employees.map(emp => emp.id);
      
      const { data: attendanceRecords, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', dateString)
        .in('employee_id', employeeIds);
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Create attendance records for all employees
      const attendanceMap = new Map(
        (attendanceRecords || []).map(record => [record.employee_id, record])
      );
      
      const attendanceData = employees.map(employee => {
        const existingRecord = attendanceMap.get(employee.id);
        return {
          id: existingRecord?.id,
          employeeId: employee.id,
          employeeName: employee.name,
          date: dateString,
          status: existingRecord?.status || 'not_set'
        };
      });
      
      setAttendanceData(attendanceData);
      
      // Cache for faster subsequent access
      dataCache.set(attendanceCacheKey, attendanceData, 3 * 60 * 1000); // 3 minutes
      console.log("AttendanceTable - Cached attendance data for", dateString);
    } catch (error) {
      console.error("AttendanceTable - Error fetching attendance:", error);
      toast({
        title: "Error fetching attendance",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDateLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEmployees();
      setLoading(false);
    };
    
    if (userProfile?.company_id) {
      loadData();
    }
  }, [userProfile?.company_id]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendance(date);
    }
  }, [employees, date]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Immediate feedback with cached data if available
      if (employees.length > 0) {
        fetchAttendance(newDate, true);
      }
    }
  };
  
  const handleStatusChange = (employeeId: string, status: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.employeeId === employeeId 
          ? { ...item, status } 
          : item
      )
    );
    
    // Invalidate cache for current date since data changed
    const dateString = date.toISOString().split('T')[0];
    const attendanceCacheKey = getCacheKey('attendance', userProfile?.company_id || '', dateString);
    dataCache.invalidate(attendanceCacheKey);
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const updates = attendanceData
        .filter(record => record.status !== 'not_set')
        .map(record => ({
          employee_id: record.employeeId,
          date: record.date,
          status: record.status
        }));

      if (updates.length === 0) {
        toast({
          title: "No attendance to save",
          description: "Please mark attendance for at least one employee.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('attendance')
        .upsert(updates, { 
          onConflict: 'employee_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Attendance saved",
        description: `Saved attendance for ${updates.length} employees.`,
      });

      // Invalidate cache and refresh data
      const dateString = date.toISOString().split('T')[0];
      dataCache.invalidate(`attendance:${userProfile?.company_id}:${dateString}`);
      await fetchAttendance(date, false); // Force fresh data
    } catch (error) {
      console.error("AttendanceTable - Error saving attendance:", error);
      toast({
        title: "Error saving attendance",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'present':
        return <Badge className="bg-green-500/20 text-green-400 animate-pulse">Present</Badge>;
      case 'short_leave':
        return <Badge className="bg-yellow-500/20 text-yellow-400 animate-pulse">Short Leave</Badge>;
      case 'leave':
        return <Badge className="bg-red-500/20 text-red-400 animate-pulse">Leave</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Not Set</Badge>;
    }
  };
  
  const autoMarkHolidayAttendance = async () => {
    try {
      if (!userProfile?.company_id) return;
      
      const holidayEvents = events.filter(event => event.type === 'holiday');
      if (holidayEvents.length === 0) return;
      
      const updates = employees.map(employee => ({
        employee_id: employee.id,
        date: date.toISOString().split('T')[0],
        status: 'present' // Auto mark as present for holidays
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(updates, { 
          onConflict: 'employee_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Holiday Attendance Marked",
        description: `All employees marked present for ${holidayEvents[0].title}.`,
      });

      // Refresh attendance data
      await fetchAttendance(date, false);
    } catch (error) {
      console.error("Error auto-marking holiday attendance:", error);
    }
  };

  useEffect(() => {
    if (events.some(event => event.type === 'holiday')) {
      autoMarkHolidayAttendance();
    }
  }, [events]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
          <span className="text-white/70">Loading employees...</span>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No active employees found. Please add employees first.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="glass-card lg:col-span-1 transform hover:scale-105 transition-transform duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-adicorp-purple" />
            Select Date
            {dateLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="rounded-md border border-white/10 bg-adicorp-dark/30 p-3 hover:border-adicorp-purple/50 transition-colors duration-300"
          />
        </CardContent>
      </Card>
      
      <Card className="glass-card lg:col-span-3 transform hover:scale-[1.01] transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Daily Attendance - {date.toLocaleDateString()}
            {events.length > 0 && (
              <div className="flex gap-2">
                {events.map(event => (
                  <Badge key={event.id} className={
                    event.type === 'holiday' ? 'bg-green-500/20 text-green-400' :
                    event.type === 'half_day' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {event.title}
                  </Badge>
                ))}
              </div>
            )}
            {dateLoading && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-adicorp-purple" />
                <span className="text-sm text-white/60">Loading...</span>
              </div>
            )}
          </CardTitle>
          <Button 
            onClick={saveAttendance}
            disabled={saving || dateLoading}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow transform hover:scale-105 transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record, index) => (
                  <TableRow 
                    key={record.employeeId}
                    className={`border-white/10 hover:bg-adicorp-purple/10 transition-all duration-300 ${
                      dateLoading ? 'opacity-60' : 'animate-fade-in'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>
                      {employees.find(emp => emp.id === record.employeeId)?.rank || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={record.status} 
                        onValueChange={(value) => handleStatusChange(record.employeeId, value)}
                        disabled={dateLoading}
                      >
                        <SelectTrigger className="w-[140px] bg-adicorp-dark/60 border-white/10 hover:border-adicorp-purple/50 transition-colors duration-200">
                          <SelectValue>
                            {getStatusBadge(record.status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-adicorp-dark-light border-white/10">
                          <SelectItem value="present">Present (Full Day)</SelectItem>
                          <SelectItem value="short_leave">Short Leave (Half Day)</SelectItem>
                          <SelectItem value="leave">Leave (Absent)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {date.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
