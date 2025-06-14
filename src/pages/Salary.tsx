
import { useState, useEffect, useCallback } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CircleDollarSign, 
  Calendar, 
  Download,
  FileSpreadsheet,
  Briefcase,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/salaryCalculations";
import { ReportDataService } from "@/services/reportDataService";

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

interface SalaryStats {
  totalBudgetSalary: number;
  totalCalculatedSalary: number;
  averageDailyRate: number;
  employeeCount: number;
}

export default function SalaryPage() {
  const [employeeSalaryData, setEmployeeSalaryData] = useState<EmployeeSalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<SalaryStats>({
    totalBudgetSalary: 0,
    totalCalculatedSalary: 0,
    averageDailyRate: 0,
    employeeCount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [totalWorkingDaysThisMonth, setTotalWorkingDaysThisMonth] = useState(0);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const currentMonth = new Date();
  const currentMonthName = format(currentMonth, "MMMM yyyy");

  const fetchAllData = useCallback(async () => {
    if (!userProfile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { employeeData, stats: reportStats } = await ReportDataService.fetchReportData(
        userProfile.company_id,
        currentMonth
      );

      // Transform to expected format
      const transformedData = employeeData.map(emp => ({
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        rank: emp.rank,
        monthlySalary: emp.monthlySalary,
        presentDays: emp.presentDays,
        shortLeaveDays: emp.shortLeaveDays,
        leaveDays: emp.leaveDays,
        calculatedSalary: emp.calculatedSalary,
        actualWorkingDays: emp.actualWorkingDays,
        dailyRate: emp.dailyRate,
      }));

      setEmployeeSalaryData(transformedData);
      setTotalWorkingDaysThisMonth(reportStats.totalWorkingDaysThisMonth);
      setStats({
        totalCalculatedSalary: reportStats.totalCalculatedSalary,
        totalBudgetSalary: reportStats.totalBudgetSalary,
        averageDailyRate: reportStats.averageDailyRate,
        employeeCount: reportStats.totalEmployees
      });
      
      console.log("Salary - Successfully processed data:", transformedData.length);
    } catch (error: any) {
      console.error("Salary - Error fetching data:", error);
      setError(error.message || "Failed to load salary data");
      toast({
        title: "Failed to load salary data",
        description: error.message || "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.company_id, currentMonth, toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDownload = useCallback(async (type: 'salary-sheet' | 'payslips') => {
    setDownloading(true);
    try {
      let csvContent = '';
      
      if (type === 'salary-sheet') {
        csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Working Days,Calculated Salary,Status\n';
        employeeSalaryData.forEach(data => {
          csvContent += `"${data.employeeName}","${data.rank}","${formatCurrency(data.monthlySalary)}","${formatCurrency(data.dailyRate)}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}","${data.actualWorkingDays > 0 ? 'Earned' : 'No Attendance'}"\n`;
        });
      } else {
        csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Present Days,Short Leave,Working Days,Calculated Salary\n';
        employeeSalaryData.forEach(data => {
          csvContent += `"${data.employeeName}","${data.rank}","${formatCurrency(data.monthlySalary)}","${formatCurrency(data.dailyRate)}","${data.presentDays}","${data.shortLeaveDays}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}"\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-${currentMonthName.replace(' ', '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download completed",
        description: `${type} exported successfully`,
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
  }, [employeeSalaryData, currentMonthName, totalWorkingDaysThisMonth, toast]);

  const handleRetry = () => {
    ReportDataService.clearCache();
    fetchAllData();
  };

  if (!userProfile?.company_id) {
    return (
      <Dashboard title="Salary Management">
        <div className="text-center py-8">
          <p className="text-white/70">Please complete company setup to view salary data.</p>
          <Button 
            onClick={() => window.location.href = '/settings'}
            className="mt-4 bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            Go to Settings
          </Button>
        </div>
      </Dashboard>
    );
  }

  if (error && !loading) {
    return (
      <Dashboard title="Salary Management">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={handleRetry} 
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="Salary Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Monthly Salary Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            ) : (
              <>
                <div className="flex items-center">
                  <CircleDollarSign className="h-5 w-5 mr-2 text-green-400" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(stats.totalBudgetSalary)}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  For {stats.employeeCount} active employees
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Calculated Salary (Attendance-Based)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            ) : (
              <>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(stats.totalCalculatedSalary)}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Based on actual attendance
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Average Daily Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            ) : (
              <>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(stats.averageDailyRate)}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Per employee per working day
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="salary-sheet" className="space-y-4">
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-2 mb-4">
          <TabsTrigger value="salary-sheet" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Salary Sheet
          </TabsTrigger>
          <TabsTrigger value="payslips" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Download className="h-4 w-4 mr-2" />
            Payslips
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="salary-sheet">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance-Based Salary Sheet - {currentMonthName}</CardTitle>
              <Button 
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => handleDownload('salary-sheet')}
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
                        <TableCell>{formatCurrency(data.monthlySalary)}</TableCell>
                        <TableCell>{formatCurrency(data.dailyRate)}</TableCell>
                        <TableCell>{data.actualWorkingDays} / {totalWorkingDaysThisMonth}</TableCell>
                        <TableCell className="font-bold text-green-400">
                          {formatCurrency(data.calculatedSalary)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payslips">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Individual Payslips - {currentMonthName}</CardTitle>
              <Button 
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => handleDownload('payslips')}
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
                            onClick={() => {
                              const csvContent = `Employee: ${data.employeeName}\nPosition: ${data.rank}\nMonthly Salary: ${formatCurrency(data.monthlySalary)}\nDaily Rate: ${formatCurrency(data.dailyRate)}\nWorking Days: ${data.actualWorkingDays}/${totalWorkingDaysThisMonth}\nPresent Days: ${data.presentDays}\nShort Leave: ${data.shortLeaveDays}\nCalculated Salary: ${formatCurrency(data.calculatedSalary)}`;
                              const blob = new Blob([csvContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `payslip-${data.employeeName}-${currentMonthName.replace(' ', '-')}.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Monthly Salary:</span>
                            <span>{formatCurrency(data.monthlySalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Daily Rate:</span>
                            <span>{formatCurrency(data.dailyRate)}</span>
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
                              {formatCurrency(data.calculatedSalary)}
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
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
