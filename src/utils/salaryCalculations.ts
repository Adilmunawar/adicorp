
import { getDailyRateDivisor, getWorkingDaysInMonth } from "./workingDays";

export interface SalaryCalculation {
  totalWorkingDays: number;
  dailyRate: number;
  actualWorkingDays: number;
  calculatedSalary: number;
}

// Calculate employee salary based on attendance with fixed divisor
export const calculateEmployeeSalary = async (
  monthlySalary: number,
  presentDays: number,
  shortLeaveDays: number,
  currentMonth: Date,
  companyId: string
): Promise<SalaryCalculation> => {
  // Always use 26 as divisor for daily rate calculation (as per requirement)
  const dailyRateDivisor = await getDailyRateDivisor(companyId);
  const dailyRate = monthlySalary / dailyRateDivisor;
  
  // Calculate actual working days (short leave counts as 0.5 days)
  const actualWorkingDays = presentDays + (shortLeaveDays * 0.5);
  const calculatedSalary = dailyRate * actualWorkingDays;
  
  return {
    totalWorkingDays: dailyRateDivisor, // For display purposes
    dailyRate,
    actualWorkingDays,
    calculatedSalary
  };
};

// Export alias for backward compatibility
export const getWorkingDaysInMonthForSalary = getWorkingDaysInMonth;

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
};
