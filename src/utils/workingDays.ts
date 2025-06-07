
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { WorkingDayConfig, EventRow } from "@/types/events";

// Get working day configuration for a company
export const getWorkingDaysConfig = async (companyId: string): Promise<WorkingDayConfig> => {
  try {
    const { data, error } = await supabase
      .from('working_days_config' as any)
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    // Default configuration if none exists
    return data || {
      company_id: companyId,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    };
  } catch (error) {
    console.error("Error fetching working days config:", error);
    // Return default config on error
    return {
      company_id: companyId,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    };
  }
};

// Check if a specific date is a working day
export const isWorkingDay = async (date: Date, companyId: string): Promise<boolean> => {
  const config = await getWorkingDaysConfig(companyId);
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
  
  const dayMapping = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  const dayKey = dayMapping[dayOfWeek as keyof typeof dayMapping] as keyof WorkingDayConfig;
  return config[dayKey] as boolean;
};

// Get events for a specific date
export const getEventsForDate = async (date: Date, companyId: string): Promise<EventRow[]> => {
  try {
    const dateString = format(date, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('events' as any)
      .select('*')
      .eq('company_id', companyId)
      .eq('date', dateString);

    if (error) throw error;
    return (data as EventRow[]) || [];
  } catch (error) {
    console.error("Error fetching events for date:", error);
    return [];
  }
};

// Check if a date should be treated as a working day considering events
export const shouldShowAttendance = async (date: Date, companyId: string): Promise<boolean> => {
  const events = await getEventsForDate(date, companyId);
  const regularWorkingDay = await isWorkingDay(date, companyId);
  
  // Check for special event types
  const hasHoliday = events.some(event => event.type === 'holiday');
  const hasSpecialWorkingDay = events.some(event => event.type === 'working_day');
  
  // If it's a holiday, don't show attendance (auto full pay)
  if (hasHoliday) return false;
  
  // If it's marked as special working day, show attendance regardless of regular config
  if (hasSpecialWorkingDay) return true;
  
  // Otherwise, follow regular working day configuration
  return regularWorkingDay;
};

// Calculate working days in a month considering configuration and events
export const getWorkingDaysInMonth = async (date: Date, companyId: string): Promise<number> => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const allDays = eachDayOfInterval({ start, end });
  
  let workingDays = 0;
  
  for (const day of allDays) {
    const events = await getEventsForDate(day, companyId);
    const regularWorkingDay = await isWorkingDay(day, companyId);
    
    const hasHoliday = events.some(event => event.type === 'holiday');
    const hasSpecialWorkingDay = events.some(event => event.type === 'working_day');
    const hasHalfDay = events.some(event => event.type === 'half_day');
    
    if (hasHoliday) {
      // Holidays count as full working days for salary calculation
      workingDays += 1;
    } else if (hasSpecialWorkingDay || regularWorkingDay) {
      if (hasHalfDay) {
        workingDays += 0.5;
      } else {
        workingDays += 1;
      }
    }
  }
  
  return workingDays;
};
