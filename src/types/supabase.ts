
import type { Database } from '@/integrations/supabase/types';

// Re-export types from Supabase
export type { Database } from '@/integrations/supabase/types';

// Define custom type aliases for easier use
export type CompanyRow = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type EmployeeRow = Database['public']['Tables']['employees']['Row'];
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export type AttendanceRow = Database['public']['Tables']['attendance']['Row'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];

// Define custom types
export type AttendanceStatus = 'present' | 'short_leave' | 'leave';
export type EmployeeStatus = 'active' | 'inactive';

// Currency formatting helper
export const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};
