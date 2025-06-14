
export interface EventRow {
  id: string;
  company_id: string;
  title: string;
  date: string;
  type: 'holiday' | 'working_day' | 'half_day' | 'off_day' | 'meeting' | 'training';
  description?: string;
  affects_attendance: boolean;
  created_at: string;
}

export interface WorkingDayConfig {
  company_id: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
