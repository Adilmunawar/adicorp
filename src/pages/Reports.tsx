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
  FileText, 
  Download,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths, subMonths } from "date-fns";
import { formatCurrencySync } from "@/utils/salaryCalculations";
import { ReportDataService } from "@/services/reportDataService";

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

interface ReportStats {
  totalCalculatedSalary: number;
  totalEmployees: number;
  averageAttendance: number;
  totalWorkingDaysThisMonth: number;
}

export default function ReportsPage() {
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStats>({
    totalCalculatedSalary: 0,
    totalEmployees: 0,
    averageAttendance: 0,
    totalWorkingDaysThisMonth: 0,
  });
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchReportsData = useCallback(async () => {
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
        totalWorkingDaysInMonth: reportStats.totalWorkingDaysThisMonth,
        actualWorkingDays: emp.actualWorkingDays,
        dailyRate: emp.dailyRate,
        calculatedSalary: emp.calculatedSalary,
      }));

      setAttendanceReport(transformedData);
      setStats({
        totalCalculatedSalary: reportStats.totalCalculatedSalary,
        totalEmployees: reportStats.totalEmployees,
        averageAttendance: reportStats.averageAttendance,
        totalWorkingDaysThisMonth: reportStats.totalWorkingDaysThisMonth,
      });

      console.log("Reports - Successfully loaded data:", transformedData.length, "employees");
    } catch (error: any) {
      setError(error.message || "Failed to load reports data");
      toast({
        title: "Failed to load reports data",
        description: error.message || "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.company_id, currentMonth, toast]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const handleDownload = useCallback(async (type: 'attendance' | 'salary') => {
    setDownloading(true);
    try {
      let csvContent = '';
      
      if (type === 'attendance') {
        csvContent = 'Employee,Position,Present Days,Short Leave,Leave Days,Actual Working Days,Performance\n';
        attendanceReport.forEach(report => {
          const performance = report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.9) 
            ? "Excellent" 
            : report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.7) 
            ? "Good" 
            : "Needs Improvement";
          csvContent += `"${report.employeeName}","${report.rank}","${report.presentDays}","${report.shortLeaveDays}","${report.leaveDays}","${report.actualWorkingDays}","${performance}"\n`;
        });
      } else {
        csvContent = 'Employee,Position,Monthly Salary,Daily Rate,Working Days,Calculated Salary,Status\n';
        attendanceReport.forEach(report => {
          csvContent += `"${report.employeeName}","${report.rank}","${formatCurrencySync(report.monthlySalary)}","${formatCurrencySync(report.dailyRate)}","${report.actualWorkingDays}/${report.totalWorkingDaysInMonth}","${formatCurrencySync(report.calculatedSalary)}","Calculated"\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-report-${format(currentMonth, "MMMM-yyyy")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download completed",
        description: `${type} report exported successfully`,
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
  }, [attendanceReport, stats.totalWorkingDaysThisMonth, currentMonth, toast]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleRetry = () => {
    ReportDataService.clearCache();
    fetchReportsData();
  };

  if (!userProfile?.company_id) {
    return (
      <Dashboard title="Reports">
        <div className="text-center py-8">
          <p className="text-white/70">Please complete company setup to view reports.</p>
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
      <Dashboard title="Reports">
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
  
  return (
    <Dashboard title="Reports">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="border-white/10 hover:bg-adicorp-dark"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="border-white/10 hover:bg-adicorp-dark"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleCurrentMonth}
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
        >
          Current Month
        </Button>
      </div>

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
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
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
                {stats.averageAttendance.toFixed(1)} days
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
                {formatCurrencySync(stats.totalCalculatedSalary)}
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
                {stats.totalWorkingDaysThisMonth} days
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
              <Button 
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => handleDownload('attendance')}
                disabled={downloading}
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
              {attendanceReport.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No attendance data found for {format(currentMonth, "MMMM yyyy")}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                                report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.9)
                                  ? "bg-green-500/20 text-green-400"
                                  : report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.7)
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.9) ? "Excellent" 
                               : report.actualWorkingDays >= (stats.totalWorkingDaysThisMonth * 0.7) ? "Good" : "Needs Improvement"}
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
        </TabsContent>
        
        <TabsContent value="salary-report">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salary Report Based on Attendance - {format(currentMonth, "MMMM yyyy")}</CardTitle>
              <Button 
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => handleDownload('salary')}
                disabled={downloading}
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
              {attendanceReport.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No salary data found for {format(currentMonth, "MMMM yyyy")}.</p>
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
                      {attendanceReport.map((report) => (
                        <TableRow 
                          key={report.employeeId} 
                          className="border-white/10 hover:bg-adicorp-dark/30"
                        >
                          <TableCell className="font-medium">{report.employeeName}</TableCell>
                          <TableCell>{report.rank}</TableCell>
                          <TableCell>{formatCurrencySync(report.monthlySalary)}</TableCell>
                          <TableCell>{formatCurrencySync(report.dailyRate)}</TableCell>
                          <TableCell>{report.actualWorkingDays} / {report.totalWorkingDaysInMonth}</TableCell>
                          <TableCell className="font-bold text-green-400">
                            {formatCurrencySync(report.calculatedSalary)}
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
