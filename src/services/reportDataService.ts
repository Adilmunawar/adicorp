
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface RawReportData {
  employees: Array<{
    id: string;
    name: string;
    rank: string;
    wage_rate: number;
  }>;
  attendance: Array<{
    employee_id: string;
    status: string;
    date: string;
  }>;
}

interface ProcessedEmployeeData {
  employeeId: string;
  employeeName: string;
  rank: string;
  monthlySalary: number;
  presentDays: number;
  shortLeaveDays: number;
  leaveDays: number;
  actualWorkingDays: number;
  dailyRate: number;
  calculatedSalary: number;
}

interface ReportStats {
  totalCalculatedSalary: number;
  totalBudgetSalary: number;
  totalEmployees: number;
  averageAttendance: number;
  averageDailyRate: number;
  totalWorkingDaysThisMonth: number;
}

// Cache to avoid repeated calculations
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ReportDataService {
  private static getWorkingDaysInMonth(month: Date): number {
    // Simple calculation - can be enhanced with company-specific working days config
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, monthNum, day);
      const dayOfWeek = currentDay.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  }

  private static calculateEmployeeData(
    employee: any,
    attendance: any[],
    totalWorkingDays: number
  ): ProcessedEmployeeData {
    const employeeAttendance = attendance.filter(att => att.employee_id === employee.id);
    
    let presentDays = 0;
    let shortLeaveDays = 0;
    let leaveDays = 0;
    
    employeeAttendance.forEach(record => {
      switch (record.status) {
        case "present":
          presentDays++;
          break;
        case "short_leave":
          shortLeaveDays++;
          break;
        case "leave":
          leaveDays++;
          break;
      }
    });
    
    const monthlySalary = Number(employee.wage_rate) || 0;
    const dailyRate = totalWorkingDays > 0 ? monthlySalary / totalWorkingDays : 0;
    const actualWorkingDays = presentDays + (shortLeaveDays * 0.5);
    const calculatedSalary = dailyRate * actualWorkingDays;
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      rank: employee.rank,
      monthlySalary,
      presentDays,
      shortLeaveDays,
      leaveDays,
      actualWorkingDays,
      dailyRate,
      calculatedSalary,
    };
  }

  private static calculateStats(employeeData: ProcessedEmployeeData[], totalWorkingDays: number): ReportStats {
    const totalCalculatedSalary = employeeData.reduce((sum, emp) => sum + emp.calculatedSalary, 0);
    const totalBudgetSalary = employeeData.reduce((sum, emp) => sum + emp.monthlySalary, 0);
    const totalEmployees = employeeData.length;
    const averageAttendance = totalEmployees > 0 
      ? employeeData.reduce((sum, emp) => sum + emp.actualWorkingDays, 0) / totalEmployees 
      : 0;
    const averageDailyRate = totalEmployees > 0
      ? employeeData.reduce((sum, emp) => sum + emp.dailyRate, 0) / totalEmployees
      : 0;
    
    return {
      totalCalculatedSalary,
      totalBudgetSalary,
      totalEmployees,
      averageAttendance,
      averageDailyRate,
      totalWorkingDaysThisMonth: totalWorkingDays,
    };
  }

  static async fetchReportData(companyId: string, month: Date): Promise<{
    employeeData: ProcessedEmployeeData[];
    stats: ReportStats;
  }> {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    const cacheKey = `${companyId}-${format(month, 'yyyy-MM')}`;
    const cached = dataCache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');

    try {
      // Single optimized query for employees
      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, rank, wage_rate")
        .eq("company_id", companyId)
        .eq("status", "active");

      if (employeesError) {
        throw new Error(`Failed to fetch employees: ${employeesError.message}`);
      }

      if (!employees || employees.length === 0) {
        const emptyResult = {
          employeeData: [],
          stats: {
            totalCalculatedSalary: 0,
            totalBudgetSalary: 0,
            totalEmployees: 0,
            averageAttendance: 0,
            averageDailyRate: 0,
            totalWorkingDaysThisMonth: this.getWorkingDaysInMonth(month),
          },
        };
        dataCache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
        return emptyResult;
      }

      // Single optimized query for attendance
      const employeeIds = employees.map(emp => emp.id);
      const { data: attendance, error: attendanceError } = await supabase
        .from("attendance")
        .select("employee_id, status, date")
        .in("employee_id", employeeIds)
        .gte("date", monthStart)
        .lte("date", monthEnd);

      if (attendanceError && attendanceError.code !== "PGRST116") {
        throw new Error(`Failed to fetch attendance: ${attendanceError.message}`);
      }

      const totalWorkingDays = this.getWorkingDaysInMonth(month);
      
      // Process all data client-side
      const employeeData = employees.map(employee => 
        this.calculateEmployeeData(employee, attendance || [], totalWorkingDays)
      );
      
      const stats = this.calculateStats(employeeData, totalWorkingDays);
      
      const result = { employeeData, stats };
      
      // Cache the result
      dataCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch report data");
    }
  }

  static clearCache() {
    dataCache.clear();
  }
}
