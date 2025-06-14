
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/salaryCalculations";

interface EmployeeSalaryData {
  employeeId: string;
  employeeName: string;
  rank: string;
  monthlySalary: number;
  presentDays: number;
  shortLeaveDays: number;
  leaveDays: number;
  calculatedSalary: number;
  actualWorkingDays: number;
  dailyRate: number;
}

export function useSalaryDownloads(
  employeeSalaryData: EmployeeSalaryData[],
  totalWorkingDaysThisMonth: number,
  currentMonthName: string
) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const downloadFile = useCallback((content: string, filename: string, type: string = 'text/csv') => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleSalarySheetDownload = useCallback(async () => {
    setDownloading(true);
    try {
      let csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Working Days,Calculated Salary,Status\n';
      employeeSalaryData.forEach(data => {
        csvContent += `"${data.employeeName}","${data.rank}","${formatCurrency(data.monthlySalary)}","${formatCurrency(data.dailyRate)}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}","${data.actualWorkingDays > 0 ? 'Earned' : 'No Attendance'}"\n`;
      });
      
      downloadFile(csvContent, `salary-sheet-${currentMonthName.replace(' ', '-')}.csv`);
      
      toast({
        title: "Download completed",
        description: "Salary sheet exported successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  }, [employeeSalaryData, currentMonthName, totalWorkingDaysThisMonth, toast, downloadFile]);

  const handlePayslipsDownload = useCallback(async () => {
    setDownloading(true);
    try {
      let csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Present Days,Short Leave,Working Days,Calculated Salary\n';
      employeeSalaryData.forEach(data => {
        csvContent += `"${data.employeeName}","${data.rank}","${formatCurrency(data.monthlySalary)}","${formatCurrency(data.dailyRate)}","${data.presentDays}","${data.shortLeaveDays}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}"\n`;
      });
      
      downloadFile(csvContent, `payslips-${currentMonthName.replace(' ', '-')}.csv`);
      
      toast({
        title: "Download completed",
        description: "Payslips exported successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  }, [employeeSalaryData, currentMonthName, totalWorkingDaysThisMonth, toast, downloadFile]);

  const handleIndividualPayslipDownload = useCallback((data: EmployeeSalaryData) => {
    const csvContent = `Employee: ${data.employeeName}\nPosition: ${data.rank}\nMonthly Salary: ${formatCurrency(data.monthlySalary)}\nDaily Rate: ${formatCurrency(data.dailyRate)}\nWorking Days: ${data.actualWorkingDays}/${totalWorkingDaysThisMonth}\nPresent Days: ${data.presentDays}\nShort Leave: ${data.shortLeaveDays}\nCalculated Salary: ${formatCurrency(data.calculatedSalary)}`;
    
    downloadFile(csvContent, `payslip-${data.employeeName}-${currentMonthName.replace(' ', '-')}.txt`, 'text/plain');
  }, [totalWorkingDaysThisMonth, currentMonthName, downloadFile]);

  return {
    downloading,
    handleSalarySheetDownload,
    handlePayslipsDownload,
    handleIndividualPayslipDownload
  };
}
