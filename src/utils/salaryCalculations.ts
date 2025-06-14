
import { dataIntegrationService } from "@/services/dataIntegrationService";
import { getDailyRateDivisor } from "@/utils/workingDays";

export interface SalaryData {
  employee_id: string;
  employee_name: string;
  basic_salary: number;
  present_days: number;
  absent_days: number;
  overtime_hours: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  working_days: number;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateMonthlySalaries = async (
  companyId: string,
  month: Date
): Promise<SalaryData[]> => {
  try {
    const [employees, salaryCalculations] = await Promise.all([
      dataIntegrationService.getEmployees(companyId),
      dataIntegrationService.calculateSalariesForMonth(companyId, month)
    ]);

    return salaryCalculations.map(calc => {
      const employee = employees.find(emp => emp.id === calc.employee_id);
      return {
        employee_id: calc.employee_id,
        employee_name: employee?.name || 'Unknown Employee',
        basic_salary: Math.round(calc.basic_salary * 100) / 100,
        present_days: calc.present_days,
        absent_days: calc.absent_days,
        overtime_hours: Math.round(calc.overtime_hours * 100) / 100,
        gross_salary: Math.round(calc.gross_salary * 100) / 100,
        deductions: Math.round(calc.deductions * 100) / 100,
        net_salary: Math.round(calc.net_salary * 100) / 100,
        working_days: calc.working_days
      };
    });
  } catch (error) {
    console.error('Error calculating monthly salaries:', error);
    return [];
  }
};

export const calculateDailySalary = async (
  baseSalary: number,
  companyId: string
): Promise<number> => {
  try {
    const dailyRateDivisor = await getDailyRateDivisor(companyId);
    return Math.round((baseSalary / dailyRateDivisor) * 100) / 100;
  } catch (error) {
    console.error('Error calculating daily salary:', error);
    return baseSalary / 22; // fallback
  }
};

export const calculateOvertimePay = async (
  baseSalary: number,
  overtimeHours: number,
  companyId: string,
  overtimeMultiplier: number = 1.5
): Promise<number> => {
  try {
    const dailyRateDivisor = await getDailyRateDivisor(companyId);
    const hourlyRate = baseSalary / (dailyRateDivisor * 8); // 8 hours per day
    const overtimeRate = hourlyRate * overtimeMultiplier;
    return Math.round(overtimeRate * overtimeHours * 100) / 100;
  } catch (error) {
    console.error('Error calculating overtime pay:', error);
    return 0;
  }
};
