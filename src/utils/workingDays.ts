
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { WorkingDayConfig } from "@/types/events";

// Get working day configuration for a company (simplified)
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

// Check if a specific date is a working day (simplified)
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

// Simplified working days calculation (default to 22 working days per month)
export const getWorkingDaysInMonth = async (date: Date, companyId: string): Promise<number> => {
  try {
    // Quick calculation: assume 22 working days per month for performance
    // This can be made more accurate later if needed
    return 22;
  } catch (error) {
    console.error("Error calculating working days:", error);
    return 22; // Default fallback
  }
};
