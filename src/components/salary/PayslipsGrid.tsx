
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { formatCurrencySync } from "@/utils/salaryCalculations";
import { useCurrency } from "@/hooks/useCurrency";

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

interface PayslipsGridProps {
  employeeSalaryData: EmployeeSalaryData[];
  totalWorkingDaysThisMonth: number;
  currentMonthName: string;
  loading: boolean;
  downloading: boolean;
  onDownloadAll: () => void;
  onDownloadIndividual: (data: EmployeeSalaryData) => void;
}

export default function PayslipsGrid({
  employeeSalaryData,
  totalWorkingDaysThisMonth,
  currentMonthName,
  loading,
  downloading,
  onDownloadAll,
  onDownloadIndividual
}: PayslipsGridProps) {
  const { currency } = useCurrency();

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Individual Payslips - {currentMonthName}</CardTitle>
        <Button 
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          onClick={onDownloadAll}
          disabled={downloading || loading}
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export All
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
          </div>
        ) : employeeSalaryData.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No active employees found. Add employees to generate payslips.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employeeSalaryData.map((data) => (
              <Card key={data.employeeId} className="bg-adicorp-dark-light/40 border-white/5">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{data.employeeName}</CardTitle>
                      <p className="text-sm text-white/60">{data.rank}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-white/10 hover:bg-adicorp-dark"
                      onClick={() => onDownloadIndividual(data)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Salary:</span>
                      <span>{formatCurrencySync(data.monthlySalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Daily Rate:</span>
                      <span>{formatCurrencySync(data.dailyRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Working Days:</span>
                      <span>{data.actualWorkingDays} / {totalWorkingDaysThisMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Present Days:</span>
                      <span>{data.presentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Short Leave:</span>
                      <span>{data.shortLeaveDays} (0.5 each)</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                      <span>Calculated Salary:</span>
                      <span className="text-green-400">
                        {formatCurrencySync(data.calculatedSalary)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
