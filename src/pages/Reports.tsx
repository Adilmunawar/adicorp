
import { useState, useEffect } from "react";
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
  FileText, 
  Download,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { calculateEmployeeSalary, formatCurrency, getWorkingDaysInMonth } from "@/utils/salaryCalculations";

interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  rank: string;
  monthlySalary: number;
  presentDays: number;
  shortLeaveDays: number;
  leaveDays: number;
  totalWorkingDaysInMonth: number;
  actualWorkingDays: number;
  dailyRate: number;
  calculatedSalary: number;
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState(new Date());
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        if (!userProfile?.company_id) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log("Reports - Fetching data for company:", userProfile.company_id);
        
        // Fetch employees
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', userProfile.company_id)
          .eq('status', 'active')
          .order('name');
          
        if (employeeError) throw employeeError;
        
        setEmployees(employeeData || []);
        
        if (employeeData && employeeData.length > 0) {
          // Fetch attendance for current month
          const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
          
          const employeeIds = employeeData.map(emp => emp.id);
          
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('*')
            .in('employee_id', employeeIds)
            .gte('date', monthStart)
            .lte('date', monthEnd);
            
          if (attendanceError && attendanceError.code !== 'PGRST116') {
            throw attendanceError;
          }
          
          // Process attendance report with proper salary calculations
          const attendanceMap = new Map();
          (attendanceData || []).forEach(record => {
            const key = record.employee_id;
            if (!attendanceMap.has(key)) {
              attendanceMap.set(key, {
                present: 0,
                shortLeave: 0,
                leave: 0
              });
            }
            
            const stats = attendanceMap.get(key);
            switch (record.status) {
              case 'present':
                stats.present++;
                break;
              case 'short_leave':
                stats.shortLeave++;
                break;
              case 'leave':
                stats.leave++;
                break;
            }
          });
          
          const reportData: AttendanceReport[] = employeeData.map(employee => {
            const attendance = attendanceMap.get(employee.id) || {
              present: 0,
              shortLeave: 0,
              leave: 0
            };
            
            const monthlySalary = Number(employee.wage_rate); // wage_rate now stores monthly salary
            const salaryCalc = calculateEmployeeSalary(
              monthlySalary,
              attendance.present,
              attendance.shortLeave,
              currentMonth
            );
            
            return {
              employeeId: employee.id,
              employeeName: employee.name,
              rank: employee.rank,
              monthlySalary,
              presentDays: attendance.present,
              shortLeaveDays: attendance.shortLeave,
              leaveDays: attendance.leave,
              totalWorkingDaysInMonth: salaryCalc.totalWorkingDays,
              actualWorkingDays: salaryCalc.actualWorkingDays,
              dailyRate: salaryCalc.dailyRate,
              calculatedSalary: salaryCalc.calculatedSalary
            };
          });
          
          setAttendanceReport(reportData);
          console.log("Reports - Processed attendance report:", reportData.length);
        }
        
      } catch (error) {
        console.error("Reports - Error loading data:", error);
        toast({
          title: "Failed to load reports data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportsData();
  }, [userProfile?.company_id, currentMonth, toast]);
  
  const totalCalculatedSalary = attendanceReport.reduce((sum, report) => sum + report.calculatedSalary, 0);
  const totalEmployees = attendanceReport.length;
  const averageAttendance = totalEmployees > 0 
    ? attendanceReport.reduce((sum, report) => sum + report.actualWorkingDays, 0) / totalEmployees
    : 0;
  const totalWorkingDaysThisMonth = getWorkingDaysInMonth(currentMonth);
  
  if (loading) {
    return (
      <Dashboard title="Reports">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-adicorp-purple mx-auto" />
            <p className="mt-4 text-white/60">Loading reports...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (!userProfile?.company_id) {
    return (
      <Dashboard title="Reports">
        <div className="text-center py-8">
          <p className="text-white/70">Please complete company setup to view reports.</p>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="Reports">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              <span className="text-2xl font-bold">{totalEmployees}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-400" />
              <span className="text-2xl font-bold">
                {averageAttendance.toFixed(1)} days
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Total Calculated Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              <span className="text-2xl font-bold">
                {formatCurrency(totalCalculatedSalary)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Working Days This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-400" />
              <span className="text-2xl font-bold">
                {totalWorkingDaysThisMonth} days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="attendance-report" className="space-y-4">
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-2 mb-4">
          <TabsTrigger value="attendance-report" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Attendance Report
          </TabsTrigger>
          <TabsTrigger value="salary-report" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Download className="h-4 w-4 mr-2" />
            Salary Report
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance-report">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Attendance Report - {format(currentMonth, "MMMM yyyy")}</CardTitle>
              <Button className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {attendanceReport.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No attendance data found for this month.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Present Days</TableHead>
                      <TableHead>Short Leave</TableHead>
                      <TableHead>Leave Days</TableHead>
                      <TableHead>Actual Working Days</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceReport.map((report) => (
                      <TableRow 
                        key={report.employeeId} 
                        className="border-white/10 hover:bg-adicorp-dark/30"
                      >
                        <TableCell className="font-medium">{report.employeeName}</TableCell>
                        <TableCell>{report.rank}</TableCell>
                        <TableCell>{report.presentDays}</TableCell>
                        <TableCell>{report.shortLeaveDays}</TableCell>
                        <TableCell>{report.leaveDays}</TableCell>
                        <TableCell className="font-bold">{report.actualWorkingDays}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              report.actualWorkingDays >= (totalWorkingDaysThisMonth * 0.9)
                                ? "bg-green-500/20 text-green-400"
                                : report.actualWorkingDays >= (totalWorkingDaysThisMonth * 0.7)
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {report.actualWorkingDays >= (totalWorkingDaysThisMonth * 0.9) ? "Excellent" 
                             : report.actualWorkingDays >= (totalWorkingDaysThisMonth * 0.7) ? "Good" : "Needs Improvement"}
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
        
        <TabsContent value="salary-report">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salary Report Based on Attendance - {format(currentMonth, "MMMM yyyy")}</CardTitle>
              <Button className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {attendanceReport.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No salary data found for this month.</p>
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
                    {attendanceReport.map((report) => (
                      <TableRow 
                        key={report.employeeId} 
                        className="border-white/10 hover:bg-adicorp-dark/30"
                      >
                        <TableCell className="font-medium">{report.employeeName}</TableCell>
                        <TableCell>{report.rank}</TableCell>
                        <TableCell>{formatCurrency(report.monthlySalary)}</TableCell>
                        <TableCell>{formatCurrency(report.dailyRate)}</TableCell>
                        <TableCell>{report.actualWorkingDays} / {report.totalWorkingDaysInMonth}</TableCell>
                        <TableCell className="font-bold text-green-400">
                          {formatCurrency(report.calculatedSalary)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Calculated
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
      </Tabs>
    </Dashboard>
  );
}
