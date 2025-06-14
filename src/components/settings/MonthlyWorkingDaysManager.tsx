
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, ChevronLeft, ChevronRight, Save, RotateCcw } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";

interface MonthlyConfig {
  id?: string;
  company_id: string;
  month: string;
  working_days_count: number;
  daily_rate_divisor: number;
  configuration: Record<string, any>;
}

export default function MonthlyWorkingDaysManager() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyConfig, setMonthlyConfig] = useState<MonthlyConfig | null>(null);
  const [workingDates, setWorkingDates] = useState<Set<string>>(new Set());
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchMonthData();
    }
  }, [userProfile?.company_id, currentMonth]);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');

      // Fetch company settings
      const { data: settings } = await supabase
        .from('company_working_settings')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .maybeSingle();

      setCompanySettings(settings);

      // Fetch monthly configuration
      const { data: config } = await supabase
        .from('monthly_working_days')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .eq('month', monthStart)
        .maybeSingle();

      setMonthlyConfig(config);

      // Calculate default working dates
      await calculateWorkingDates(settings, config);
    } catch (error) {
      console.error("Error fetching month data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingDates = async (settings: any, config: MonthlyConfig | null) => {
    const defaultSettings = settings || {
      weekend_saturday: false,
      weekend_sunday: true,
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const workingDatesSet = new Set<string>();

    // Fetch events that affect attendance
    const { data: events } = await supabase
      .from('events')
      .select('date, type, affects_attendance')
      .eq('company_id', userProfile?.company_id)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'));

    const offDayEvents = new Set(
      events?.filter(e => e.affects_attendance && ['holiday', 'off_day'].includes(e.type))
        .map(e => e.date) || []
    );

    allDates.forEach(date => {
      const dayOfWeek = getDay(date); // 0=Sunday, 6=Saturday
      const dateStr = format(date, 'yyyy-MM-dd');
      let isWorkingDay = true;

      // Check weekends
      if (dayOfWeek === 0 && defaultSettings.weekend_sunday) {
        isWorkingDay = false;
      }
      if (dayOfWeek === 6 && !defaultSettings.weekend_saturday) {
        isWorkingDay = false;
      }

      // Check events
      if (offDayEvents.has(dateStr)) {
        isWorkingDay = false;
      }

      // Apply monthly configuration overrides
      if (config?.configuration && config.configuration[dateStr] !== undefined) {
        isWorkingDay = config.configuration[dateStr];
      }

      if (isWorkingDay) {
        workingDatesSet.add(dateStr);
      }
    });

    setWorkingDates(workingDatesSet);
  };

  const toggleDate = (dateStr: string) => {
    setWorkingDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      
      // Convert working dates to configuration object
      const configuration: Record<string, boolean> = {};
      const monthDates = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      });

      monthDates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        configuration[dateStr] = workingDates.has(dateStr);
      });

      const configData = {
        company_id: userProfile?.company_id,
        month: monthStart,
        working_days_count: workingDates.size,
        daily_rate_divisor: 26, // Always 26 as per requirement
        configuration,
      };

      const { error } = await supabase
        .from('monthly_working_days')
        .upsert(configData, { onConflict: 'company_id,month' });

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: `Working days for ${format(currentMonth, 'MMMM yyyy')} have been updated.`,
      });

      await fetchMonthData(); // Refresh data
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save working days configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchMonthData(); // Reset to original configuration
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group dates by weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDates.forEach(date => {
    if (getDay(date) === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-adicorp-purple" />
            Monthly Working Days Manager
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="border-white/10 hover:bg-adicorp-dark"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold px-4">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="border-white/10 hover:bg-adicorp-dark"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Working Days: {workingDates.size}
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Daily Rate: Salary ÷ 26
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-white/10 hover:bg-adicorp-dark"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/60">Loading calendar...</div>
        ) : (
          <div className="space-y-2">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-white/60 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const date = week.find(d => getDay(d) === dayIndex);
                  if (!date) {
                    return <div key={dayIndex} className="p-2" />;
                  }

                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isWorkingDay = workingDates.has(dateStr);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => toggleDate(dateStr)}
                      className={`
                        p-2 text-sm rounded-lg border transition-all
                        ${isWorkingDay 
                          ? 'bg-green-500/20 border-green-500/40 text-green-300' 
                          : 'bg-red-500/10 border-red-500/20 text-red-300'
                        }
                        ${isToday ? 'ring-2 ring-adicorp-purple' : ''}
                        hover:scale-105 hover:shadow-md
                      `}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-white/60 space-y-1">
          <p>• Click on any date to toggle between working day (green) and off day (red)</p>
          <p>• Green dates will appear in attendance marking</p>
          <p>• Red dates (holidays, Eid, etc.) will be excluded from attendance</p>
          <p>• Daily rate is always calculated as: Monthly Salary ÷ 26</p>
        </div>
      </CardContent>
    </Card>
  );
}
