
import { getWorkingDaysInMonth } from "./workingDays";

export interface SalaryCalculation {
  totalWorkingDays: number;
  dailyRate: number;
  actualWorkingDays: number;
  calculatedSalary: number;
}

// Export the working days function for use in other files
export const getWorkingDaysInMonthForSalary = async (date: Date, companyId: string): Promise<number> => {
  return await getWorkingDaysInMonth(date, companyId);
};

// Calculate employee salary based on attendance (simplified)
export const calculateEmployeeSalary = async (
  monthlySalary: number,
  presentDays: number,
  shortLeaveDays: number,
  currentMonth: Date,
  companyId: string
): Promise<SalaryCalculation> => {
  const totalWorkingDays = await getWorkingDaysInMonthForSalary(currentMonth, companyId);
  const dailyRate = monthlySalary / totalWorkingDays;
  
  // Calculate actual working days (short leave counts as 0.5 days)
  const actualWorkingDays = presentDays + (shortLeaveDays * 0.5);
  const calculatedSalary = dailyRate * actualWorkingDays;
  
  return {
    totalWorkingDays,
    dailyRate,
    actualWorkingDays,
    calculatedSalary
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
};
