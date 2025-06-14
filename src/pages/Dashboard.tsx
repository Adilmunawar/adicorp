import { useState, useEffect, useMemo, useCallback } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Loader2,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { calculateEmployeeSalary, getWorkingDaysInMonthForSalary } from "@/utils/salaryCalculations";

interface DashboardStats {
  totalEmployees: number;
  totalAttendanceToday: number;
  monthlyExpectedExpenses: number;
  actualMonthlyExpenses: number;
  averageAttendance: number;
  workingDaysThisMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalAttendanceToday: 0,
    monthlyExpectedExpenses: 0,
    actualMonthlyExpenses: 0,
    averageAttendance: 0,
    workingDaysThisMonth: 22 // Default working days
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const currentMonth = new Date();
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  // Memoized calculations for better performance
  const displayStats = useMemo(() => {
    const attendancePercentage = stats.totalEmployees > 0 
      ? Math.round((stats.totalAttendanceToday / stats.totalEmployees) * 100)
      : 0;
    
    const expenseSavings = stats.monthlyExpectedExpenses - stats.actualMonthlyExpenses;
    const savingsPercentage = stats.monthlyExpectedExpenses > 0 
      ? Math.round((expenseSavings / stats.monthlyExpectedExpenses) * 100)
      : 0;

    return {
      attendancePercentage,
      expenseSavings,
      savingsPercentage
    };
  }, [stats]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      if (!userProfile?.company_id) {
        console.log("Dashboard - No company ID, skipping fetch");
        setLoading(false);
        return;
      }

      console.log("Dashboard - Fetching data for company:", userProfile.company_id);
      
      // Simplified queries for better performance
      const [employeesResult, todayAttendanceResult, monthAttendanceResult] = await Promise.all([
        supabase
          .from('employees')
          .select('id, name, wage_rate, rank')
          .eq('company_id', userProfile.company_id)
          .eq('status', 'active'),
        supabase
          .from('attendance')
          .select('employee_id, status')
          .eq('date', today),
        supabase
          .from('attendance')
          .select('employee_id, status, date')
          .gte('date', monthStart)
          .lte('date', monthEnd)
      ]);

      if (employeesResult.error) throw new Error(`Failed to fetch employees: ${employeesResult.error.message}`);
      if (todayAttendanceResult.error) throw new Error(`Failed to fetch today's attendance: ${todayAttendanceResult.error.message}`);
      if (monthAttendanceResult.error && monthAttendanceResult.error.code !== 'PGRST116') throw new Error(`Failed to fetch monthly attendance: ${monthAttendanceResult.error.message}`);

      const employees = employeesResult.data || [];
      const employeeIds = new Set(employees.map(emp => emp.id));
      
      // Filter attendance data for current company employees only
      const todayAttendance = (todayAttendanceResult.data || [])
        .filter(att => employeeIds.has(att.employee_id));

      // --- Real Actual Expenses calculation below ---

      // All attendance in this month for active employees
      const attendanceData = monthAttendanceResult.data || [];
      // Make a map: employeeId -> attendance records (for this month)
      const attendanceMap: Record<string, {present: number, shortLeave: number, leave: number}> = {};
      for (const emp of employees) {
        attendanceMap[emp.id] = {present: 0, shortLeave: 0, leave: 0};
      }
      attendanceData.forEach(record => {
        if (!attendanceMap[record.employee_id]) return;
        switch (record.status) {
          case "present":
            attendanceMap[record.employee_id].present += 1;
            break;
          case "short_leave":
            attendanceMap[record.employee_id].shortLeave += 1;
            break;
          case "leave":
            attendanceMap[record.employee_id].leave += 1;
            break;
        }
      });

      // Calculate working days for current month
      const workingDaysThisMonth = await getWorkingDaysInMonthForSalary(currentMonth, userProfile.company_id);

      // Compute attendance-based actual salary for each employee
      let actualMonthlyExpenses = 0;
      let monthlyExpectedExpenses = 0;
      let totalAttendance = 0;

      for (const emp of employees) {
        const monthlySalary = Number(emp.wage_rate || 0);
        const {present, shortLeave} = attendanceMap[emp.id] || {present: 0, shortLeave: 0};
        // Calculate salary based on attendance
        const salaryCalc = await calculateEmployeeSalary(
          monthlySalary,
          present,
          shortLeave,
          currentMonth,
          userProfile.company_id,
        );
        actualMonthlyExpenses += salaryCalc.calculatedSalary;
        monthlyExpectedExpenses += monthlySalary;
        totalAttendance += present + (shortLeave * 0.5);
      }

      const todayPresentCount = todayAttendance.filter(att => att.status === 'present').length;

      // Avoid division by zero; averageAttendance in percent
      const averageAttendance = employees.length > 0 && workingDaysThisMonth > 0
        ? (totalAttendance / (employees.length * workingDaysThisMonth)) * 100
        : 0;

      const newStats: DashboardStats = {
        totalEmployees: employees.length,
        totalAttendanceToday: todayPresentCount,
        monthlyExpectedExpenses,
        actualMonthlyExpenses,
        averageAttendance,
        workingDaysThisMonth
      };

      setStats(newStats);
      console.log("Dashboard - Stats calculated successfully:", newStats);

    } catch (error: any) {
      console.error("Dashboard - Error fetching data:", error);
      setError(error.message || "Failed to load dashboard data");
      toast({
        title: "Failed to load dashboard data",
        description: error.message || "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.company_id, today, toast, currentMonth, monthStart, monthEnd]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [fetchDashboardData, userProfile?.company_id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  if (loading) {
    return (
      <Dashboard title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-adicorp-purple mx-auto" />
            <p className="mt-4 text-white/60">Loading dashboard...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard title="Dashboard">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-adicorp-purple hover:bg-adicorp-purple-dark">
            Retry
          </Button>
        </div>
      </Dashboard>
    );
  }

  if (!userProfile?.company_id) {
    return (
      <Dashboard title="Dashboard">
        <div className="text-center py-8">
          <p className="text-white/70">Please complete company setup to view dashboard.</p>
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

  return (
    <Dashboard title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-white/60">
            Here's what's happening with your team today.
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-white/10 hover:bg-adicorp-dark"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-xs text-white/60 mt-1">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-400" />
              <span className="text-2xl font-bold">{stats.totalAttendanceToday}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {displayStats.attendancePercentage}% present today
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats.monthlyExpectedExpenses)}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Expected monthly expenses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Actual Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats.actualMonthlyExpenses)}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Based on attendance ({displayStats.savingsPercentage}% savings)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Working Days This Month:</span>
              <span className="font-bold">{stats.workingDaysThisMonth} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Average Attendance:</span>
              <span className="font-bold">{stats.averageAttendance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Budget vs Actual:</span>
              <span className="font-bold text-green-400">
                {formatCurrency(displayStats.expenseSavings)} saved
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
              onClick={() => window.location.href = '/attendance'}
            >
              Mark Today's Attendance
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-adicorp-dark"
              onClick={() => window.location.href = '/employees'}
            >
              Manage Employees
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-adicorp-dark"
              onClick={() => window.location.href = '/reports'}
            >
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
