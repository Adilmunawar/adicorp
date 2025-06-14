
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { WorkingDayConfig } from "@/types/events";

// Get working day configuration for a company
export const getWorkingDaysConfig = async (companyId: string): Promise<WorkingDayConfig> => {
  try {
    const { data, error } = await supabase
      .from('working_days_config')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching working days config:", error);
    }

    // Default configuration if none exists
    if (!data) {
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

    return data;
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

// Get working days for a specific month using the new database function
export const getWorkingDaysInMonth = async (date: Date, companyId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_working_days_for_month', {
      target_company_id: companyId,
      target_month: format(startOfMonth(date), 'yyyy-MM-dd')
    });

    if (error) {
      console.error("Error getting working days from function:", error);
      return 22; // Default fallback
    }

    if (data && data.length > 0) {
      return data[0].total_working_days;
    }

    return 22; // Default fallback
  } catch (error) {
    console.error("Error in getWorkingDaysInMonth:", error);
    return 22; // Default fallback
  }
};

// Get working dates for a specific month
export const getWorkingDatesInMonth = async (date: Date, companyId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_working_days_for_month', {
      target_company_id: companyId,
      target_month: format(startOfMonth(date), 'yyyy-MM-dd')
    });

    if (error) {
      console.error("Error getting working dates from function:", error);
      return [];
    }

    if (data && data.length > 0 && data[0].working_dates) {
      return data[0].working_dates.map((dateStr: string) => format(new Date(dateStr), 'yyyy-MM-dd'));
    }

    return [];
  } catch (error) {
    console.error("Error in getWorkingDatesInMonth:", error);
    return [];
  }
};

// Check if a specific date is a working day
export const isWorkingDay = async (date: Date, companyId: string): Promise<boolean> => {
  try {
    const workingDates = await getWorkingDatesInMonth(date, companyId);
    const dateStr = format(date, 'yyyy-MM-dd');
    return workingDates.includes(dateStr);
  } catch (error) {
    console.error("Error checking if working day:", error);
    // Fallback to basic logic
    const dayOfWeek = getDay(date);
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  }
};

// Get daily rate divisor based on Saturday working status
export const getDailyRateDivisor = async (companyId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('company_working_settings')
      .select('weekend_saturday')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching company settings:", error);
    }

    // If Saturday is a working day, divide by 26, otherwise by 22
    return data?.weekend_saturday ? 26 : 22;
  } catch (error) {
    console.error("Error in getDailyRateDivisor:", error);
    return 22; // Default to 22 (Saturday off)
  }
};
