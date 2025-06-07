
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

export interface SalaryCalculation {
  totalWorkingDays: number;
  dailyRate: number;
  actualWorkingDays: number;
  calculatedSalary: number;
}

// Calculate working days in a month (excluding Sundays)
export const getWorkingDaysInMonth = (date: Date): number => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  const allDays = eachDayOfInterval({ start, end });
  
  // Filter out Sundays (getDay() returns 0 for Sunday)
  const workingDays = allDays.filter(day => getDay(day) !== 0);
  
  return workingDays.length;
};

// Calculate employee salary based on attendance
export const calculateEmployeeSalary = (
  monthlySalary: number,
  presentDays: number,
  shortLeaveDays: number,
  currentMonth: Date
): SalaryCalculation => {
  const totalWorkingDays = getWorkingDaysInMonth(currentMonth);
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
