
import { supabase } from "@/integrations/supabase/client";
import { getWorkingDaysInMonth, getWorkingDatesInMonth, getDailyRateDivisor } from "@/utils/workingDays";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface EmployeeData {
  id: string;
  name: string;
  rank: string;
  wage_rate: number;
  status: string;
  company_id: string;
  created_at: string;
  user_id: string | null;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'short_leave';
  created_at: string;
}

export interface SalaryCalculation {
  employee_id: string;
  basic_salary: number;
  working_days: number;
  present_days: number;
  absent_days: number;
  overtime_hours: number;
  overtime_rate: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
}

class DataIntegrationService {
  private static instance: DataIntegrationService;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService();
    }
    return DataIntegrationService.instance;
  }

  private getCacheKey(prefix: string, params: any): string {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  private isExpired(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return !expiry || Date.now() > expiry;
  }

  private setCache(key: string, data: any, ttlMinutes = 5): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  private getCache(key: string): any {
    if (this.isExpired(key)) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  async getEmployees(companyId: string): Promise<EmployeeData[]> {
    const cacheKey = this.getCacheKey('employees', { companyId });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;

      const employees = data || [];
      this.setCache(cacheKey, employees);
      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async getAttendanceForMonth(companyId: string, month: Date): Promise<AttendanceRecord[]> {
    const cacheKey = this.getCacheKey('attendance', { 
      companyId, 
      month: format(month, 'yyyy-MM')
    });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      // First get all employees for this company
      const employees = await this.getEmployees(companyId);
      const employeeIds = employees.map(emp => emp.id);

      if (employeeIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .in('employee_id', employeeIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;

      const attendance = data || [];
      this.setCache(cacheKey, attendance);
      return attendance;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  }

  async calculateSalariesForMonth(companyId: string, month: Date): Promise<SalaryCalculation[]> {
    const cacheKey = this.getCacheKey('salaries', { 
      companyId, 
      month: format(month, 'yyyy-MM')
    });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const [employees, attendance, workingDays, dailyRateDivisor] = await Promise.all([
        this.getEmployees(companyId),
        this.getAttendanceForMonth(companyId, month),
        getWorkingDaysInMonth(month, companyId),
        getDailyRateDivisor(companyId)
      ]);

      const calculations: SalaryCalculation[] = employees.map(employee => {
        const employeeAttendance = attendance.filter(a => a.employee_id === employee.id);
        const presentDays = employeeAttendance.filter(a => a.status === 'present').length;
        const shortLeaveDays = employeeAttendance.filter(a => a.status === 'short_leave').length;
        const actualWorkingDays = presentDays + (shortLeaveDays * 0.5);
        const absentDays = workingDays - actualWorkingDays;

        const dailyRate = employee.wage_rate / dailyRateDivisor;
        const basicSalary = dailyRate * actualWorkingDays;
        const overtimeRate = dailyRate / 8 * 1.5; // 1.5x overtime rate per hour
        const totalOvertimeHours = 0; // No overtime data in current schema
        const overtimePay = totalOvertimeHours * overtimeRate;
        const grossSalary = basicSalary + overtimePay;
        
        // Basic deductions (can be enhanced)
        const taxDeduction = grossSalary * 0.05; // 5% tax
        const deductions = taxDeduction;
        const netSalary = grossSalary - deductions;

        return {
          employee_id: employee.id,
          basic_salary: basicSalary,
          working_days: workingDays,
          present_days: presentDays,
          absent_days: absentDays,
          overtime_hours: totalOvertimeHours,
          overtime_rate: overtimeRate,
          gross_salary: grossSalary,
          deductions,
          net_salary: netSalary
        };
      });

      this.setCache(cacheKey, calculations);
      return calculations;
    } catch (error) {
      console.error('Error calculating salaries:', error);
      return [];
    }
  }

  async getCompanyStats(companyId: string, month: Date) {
    const cacheKey = this.getCacheKey('company_stats', { 
      companyId, 
      month: format(month, 'yyyy-MM')
    });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const [employees, attendance, salaries, workingDays] = await Promise.all([
        this.getEmployees(companyId),
        this.getAttendanceForMonth(companyId, month),
        this.calculateSalariesForMonth(companyId, month),
        getWorkingDaysInMonth(month, companyId)
      ]);

      const totalEmployees = employees.length;
      const presentRecords = attendance.filter(a => a.status === 'present').length;
      const totalPossibleAttendance = totalEmployees * workingDays;
      const averageAttendance = totalPossibleAttendance > 0 ? (presentRecords / totalPossibleAttendance) * 100 : 0;
      const totalSalaryExpense = salaries.reduce((sum, s) => sum + s.net_salary, 0);
      const totalOvertimeHours = salaries.reduce((sum, s) => sum + s.overtime_hours, 0);

      const stats = {
        totalEmployees,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        totalSalaryExpense: Math.round(totalSalaryExpense * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        workingDays,
        presentEmployees: new Set(attendance.filter(a => a.status === 'present').map(a => a.employee_id)).size,
        absentEmployees: totalEmployees - new Set(attendance.filter(a => a.status === 'present').map(a => a.employee_id)).size
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting company stats:', error);
      return {
        totalEmployees: 0,
        averageAttendance: 0,
        totalSalaryExpense: 0,
        totalOvertimeHours: 0,
        workingDays: 0,
        presentEmployees: 0,
        absentEmployees: 0
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  clearCacheForCompany(companyId: string): void {
    for (const [key] of this.cache) {
      if (key.includes(companyId)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

export const dataIntegrationService = DataIntegrationService.getInstance();
