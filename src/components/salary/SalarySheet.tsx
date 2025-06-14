
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface SalarySheetProps {
  employeeSalaryData: EmployeeSalaryData[];
  totalWorkingDaysThisMonth: number;
  currentMonthName: string;
  loading: boolean;
  downloading: boolean;
  onDownload: () => void;
}

export default function SalarySheet({
  employeeSalaryData,
  totalWorkingDaysThisMonth,
  currentMonthName,
  loading,
  downloading,
  onDownload
}: SalarySheetProps) {
  const { currency } = useCurrency();

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance-Based Salary Sheet - {currentMonthName}</CardTitle>
        <Button 
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          onClick={onDownload}
          disabled={downloading || loading}
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
          </div>
        ) : employeeSalaryData.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No active employees found. Add employees to generate salary sheets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Calculated Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeSalaryData.map((data) => (
                  <TableRow 
                    key={data.employeeId} 
                    className="border-white/10 hover:bg-adicorp-dark/30"
                  >
                    <TableCell className="font-medium">{data.employeeName}</TableCell>
                    <TableCell>{data.rank}</TableCell>
                    <TableCell>{formatCurrencySync(data.monthlySalary)}</TableCell>
                    <TableCell>{formatCurrencySync(data.dailyRate)}</TableCell>
                    <TableCell>{data.actualWorkingDays} / {totalWorkingDaysThisMonth}</TableCell>
                    <TableCell className="font-bold text-green-400">
                      {formatCurrencySync(data.calculatedSalary)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        data.actualWorkingDays > 0 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }>
                        {data.actualWorkingDays > 0 ? "Earned" : "No Attendance"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
