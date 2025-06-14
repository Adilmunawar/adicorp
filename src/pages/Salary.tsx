import { useState, useEffect, useMemo, useCallback } from "react";
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
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { calculateEmployeeSalary, formatCurrency, getWorkingDaysInMonthForSalary } from "@/utils/salaryCalculations";

interface EmployeeSalaryData {
  employee: EmployeeRow;
  presentDays: number;
  shortLeaveDays: number;
  leaveDays: number;
  calculatedSalary: number;
  actualWorkingDays: number;
  dailyRate: number;
}

export default function SalaryPage() {
  const [employeeSalaryData, setEmployeeSalaryData] = useState<EmployeeSalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({
    totalBudgetSalary: 0,
    totalCalculatedSalary: 0,
    averageDailyRate: 0,
    employeeCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<null | string>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("salary-sheet");
  const [totalWorkingDaysThisMonth, setTotalWorkingDaysThisMonth] = useState(0);
  
  const currentMonth = new Date();
  const currentMonthName = format(currentMonth, "MMMM yyyy");

  // Memoized calculations for better performance
  const salaryStats = useMemo(() => {
    const totalCalculatedSalary = employeeSalaryData.reduce((total, data) => total + data.calculatedSalary, 0);
    const totalBudgetSalary = employeeSalaryData.reduce((total, data) => total + Number(data.employee.wage_rate), 0);
    const averageDailyRate = employeeSalaryData.length > 0 
      ? employeeSalaryData.reduce((total, data) => total + data.dailyRate, 0) / employeeSalaryData.length
      : 0;
    
    return {
      totalCalculatedSalary,
      totalBudgetSalary,
      averageDailyRate
    };
  }, [employeeSalaryData]);
  
  // NEW: batch processing logic for attendance => salary data
  const fetchSalaryData = useCallback(async () => {
    try {
      if (!userProfile?.company_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("Salary - Fetching salary data for company:", userProfile.company_id);

      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      // Get total working days for this month
      const workingDays = await getWorkingDaysInMonthForSalary(currentMonth, userProfile.company_id);
      setTotalWorkingDaysThisMonth(workingDays);

      // Fetch employees and attendance in parallel
      const [employeesResult, attendanceResult] = await Promise.all([
        supabase
          .from("employees")
          .select("*")
          .eq("company_id", userProfile.company_id)
          .eq("status", "active")
          .order("name"),
        supabase
          .from("attendance")
          .select("employee_id,status,date")
          .gte("date", monthStart)
          .lte("date", monthEnd),
      ]);

      if (employeesResult.error) {
        throw employeesResult.error;
      }
      if (attendanceResult.error && attendanceResult.error.code !== "PGRST116") {
        throw attendanceResult.error;
      }

      const employees = employeesResult.data || [];
      const attendanceData = attendanceResult.data || [];

      if (employees.length === 0) {
        setEmployeeSalaryData([]);
        setLoading(false);
        return;
      }

      // Create a map of employeeId -> attendance array
      const employeeIds = employees.map((emp) => emp.id);
      const attendanceMap = new Map();
      for (const att of attendanceData) {
        if (!employeeIds.includes(att.employee_id)) continue;
        if (!attendanceMap.has(att.employee_id)) {
          attendanceMap.set(att.employee_id, []);
        }
        attendanceMap.get(att.employee_id).push(att);
      }

      // Process salaries in parallel for all employees (faster for large data)
      const salaryData: EmployeeSalaryData[] = await Promise.all(
        employees.map(async (employee) => {
          const attendance = attendanceMap.get(employee.id) || [];
          let present = 0, shortLeave = 0, leave = 0;
          attendance.forEach((rec) => {
            switch (rec.status) {
              case "present":
                present++;
                break;
              case "short_leave":
                shortLeave++;
                break;
              case "leave":
                leave++;
                break;
            }
          });
          const monthlySalary = Number(employee.wage_rate);
          const salaryCalc = await calculateEmployeeSalary(
            monthlySalary,
            present,
            shortLeave,
            currentMonth,
            userProfile.company_id
          );
          return {
            employee,
            presentDays: present,
            shortLeaveDays: shortLeave,
            leaveDays: leave,
            calculatedSalary: salaryCalc.calculatedSalary,
            actualWorkingDays: salaryCalc.actualWorkingDays,
            dailyRate: salaryCalc.dailyRate,
          };
        })
      );

      setEmployeeSalaryData(salaryData);
      console.log("Salary - Processed salary data:", salaryData.length);
    } catch (error) {
      console.error("Salary - Error fetching salary data:", error);
      toast({
        title: "Failed to load salary data",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.company_id, currentMonth, toast]);

  // Only server-side stats for cards!
  const fetchSalaryStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      if (!userProfile?.company_id) {
        setStatsLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_monthly_salary_stats", {
        target_month: format(currentMonth, "yyyy-MM-dd"),
        in_company_id: userProfile.company_id,
      });
      if (error) throw error;
      if (data && data.length > 0) {
        setStats({
          totalCalculatedSalary: Number(data[0].total_calculated_salary),
          totalBudgetSalary: Number(data[0].total_budget_salary),
          averageDailyRate: Number(data[0].average_daily_rate),
          employeeCount: Number(data[0].employee_count) ?? 0,
        });
      }
    } catch (err: any) {
      setStatsError(err.message || "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, [userProfile?.company_id, currentMonth]);

  // Fetch stats & salary data in parallel
  useEffect(() => {
    fetchSalaryStats();
    fetchSalaryData();
  }, [fetchSalaryStats, fetchSalaryData]);

  // Spinner timeout fallback for stats
  useEffect(() => {
    if (statsLoading) {
      const timer = setTimeout(() => {
        setStatsLoading(false);
        setStatsError("Loading timed out. Please retry.");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [statsLoading]);

  const handleDownload = useCallback(async (type: 'salary-sheet' | 'payslips') => {
    setDownloading(true);
    try {
      // Create CSV content
      let csvContent = '';
      
      if (type === 'salary-sheet') {
        csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Working Days,Calculated Salary,Status\n';
        employeeSalaryData.forEach(data => {
          csvContent += `"${data.employee.name}","${data.employee.rank}","${formatCurrency(Number(data.employee.wage_rate))}","${formatCurrency(data.dailyRate)}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}","${data.actualWorkingDays > 0 ? 'Earned' : 'No Attendance'}"\n`;
        });
      } else {
        csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Present Days,Short Leave,Working Days,Calculated Salary\n';
        employeeSalaryData.forEach(data => {
          csvContent += `"${data.employee.name}","${data.employee.rank}","${formatCurrency(Number(data.employee.wage_rate))}","${formatCurrency(data.dailyRate)}","${data.presentDays}","${data.shortLeaveDays}","${data.actualWorkingDays}/${totalWorkingDaysThisMonth}","${formatCurrency(data.calculatedSalary)}"\n`;
        });
      }
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-${currentMonthName.replace(' ', '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
  
  // Summary Card rendering (update to use new "stats")
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
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            ) : statsError ? (
              <div className="text-xs text-red-400">{statsError}</div>
            ) : (
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-green-400" />
                <span className="text-2xl font-bold">
                  {formatCurrency(stats.totalBudgetSalary)}
                </span>
              </div>
            )}
            {!statsLoading && !statsError &&
              <p className="text-xs text-white/60 mt-1">
                For {stats.employeeCount} active employees
              </p>
            }
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Calculated Salary (Attendance-Based)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            ) : statsError ? (
              <div className="text-xs text-red-400">{statsError}</div>
            ) : (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-2xl font-bold">
                  {formatCurrency(stats.totalCalculatedSalary)}
                </span>
              </div>
            )}
            {!statsLoading && !statsError &&
              <p className="text-xs text-white/60 mt-1">
                Based on actual attendance
              </p>
            }
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Average Daily Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            ) : statsError ? (
              <div className="text-xs text-red-400">{statsError}</div>
            ) : (
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                <span className="text-2xl font-bold">
                  {formatCurrency(stats.averageDailyRate)}
                </span>
              </div>
            )}
            {!statsLoading && !statsError &&
              <p className="text-xs text-white/60 mt-1">
                Per employee per working day
              </p>
            }
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="salary-sheet" className="space-y-4" onValueChange={setActiveTab}>
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
                        key={data.employee.id} 
                        className="border-white/10 hover:bg-adicorp-dark/30"
                      >
                        <TableCell className="font-medium">{data.employee.name}</TableCell>
                        <TableCell>{data.employee.rank}</TableCell>
                        <TableCell>{formatCurrency(Number(data.employee.wage_rate))}</TableCell>
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
                    <Card key={data.employee.id} className="bg-adicorp-dark-light/40 border-white/5">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{data.employee.name}</CardTitle>
                            <p className="text-sm text-white/60">{data.employee.rank}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/10 hover:bg-adicorp-dark"
                            onClick={() => {
                              const csvContent = `Employee: ${data.employee.name}\nPosition: ${data.employee.rank}\nMonthly Salary: ${formatCurrency(Number(data.employee.wage_rate))}\nDaily Rate: ${formatCurrency(data.dailyRate)}\nWorking Days: ${data.actualWorkingDays}/${totalWorkingDaysThisMonth}\nPresent Days: ${data.presentDays}\nShort Leave: ${data.shortLeaveDays}\nCalculated Salary: ${formatCurrency(data.calculatedSalary)}`;
                              const blob = new Blob([csvContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `payslip-${data.employee.name}-${currentMonthName.replace(' ', '-')}.txt`;
                              link.click();
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
                            <span>{formatCurrency(Number(data.employee.wage_rate))}</span>
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
