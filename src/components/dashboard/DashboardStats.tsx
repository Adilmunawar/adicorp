
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, DollarSign, TrendingUp, Clock, UserCheck } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";

export default function DashboardStats() {
  const { userProfile } = useAuth();
  const { currency } = useCurrency();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', userProfile?.company_id],
    queryFn: async () => {
      if (!userProfile?.company_id) return null;

      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      // Get total employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, wage_rate, status')
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;

      // Get today's attendance by joining with employees table
      const { data: todayAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id, 
          employee_id,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', userProfile.company_id)
        .gte('date', startOfToday.toISOString().split('T')[0])
        .lte('date', endOfToday.toISOString().split('T')[0]);

      if (attendanceError) throw attendanceError;

      // Get this month's attendance count
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: monthlyAttendance, error: monthlyError } = await supabase
        .from('attendance')
        .select(`
          id,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', userProfile.company_id)
        .gte('date', startOfMonth.toISOString().split('T')[0]);

      if (monthlyError) throw monthlyError;

      // Calculate stats
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
      const totalWageRate = employees?.reduce((sum, emp) => sum + emp.wage_rate, 0) || 0;
      const todayAttendanceCount = todayAttendance?.length || 0;
      const monthlyAttendanceCount = monthlyAttendance?.length || 0;
      const attendanceRate = activeEmployees > 0 ? Math.round((todayAttendanceCount / activeEmployees) * 100) : 0;

      return {
        totalEmployees,
        activeEmployees,
        todayAttendance: todayAttendanceCount,
        monthlyAttendance: monthlyAttendanceCount,
        totalWageRate,
        attendanceRate
      };
    },
    enabled: !!userProfile?.company_id,
  });

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${currency || 'USD'} ${amount.toLocaleString()}`;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      description: `${stats.activeEmployees} active`,
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      description: `${stats.attendanceRate}% attendance rate`,
      icon: UserCheck,
      color: "text-green-400"
    },
    {
      title: "Monthly Attendance",
      value: stats.monthlyAttendance,
      description: "Total this month",
      icon: Calendar,
      color: "text-purple-400"
    },
    {
      title: "Total Wage Budget",
      value: formatCurrency(stats.totalWageRate),
      description: "Combined wage rates",
      icon: DollarSign,
      color: "text-yellow-400"
    },
    {
      title: "Current Date",
      value: format(new Date(), "MMM dd"),
      description: format(new Date(), "yyyy"),
      icon: Clock,
      color: "text-cyan-400"
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      description: "Today's rate",
      icon: TrendingUp,
      color: "text-pink-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="glass-card hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{stat.description}</p>
                </div>
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
