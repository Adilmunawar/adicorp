
import { useEffect, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Users, Clock, DollarSign, TrendingUp, Calendar, Shield } from "lucide-react";
import { dataIntegrationService } from "@/services/dataIntegrationService";
import { format } from "date-fns";
import { formatCurrencySync } from "@/utils/salaryCalculations";
import { useCurrency } from "@/hooks/useCurrency";

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { currency } = useCurrency();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    averageAttendance: 0,
    totalSalaryExpense: 0,
    totalOvertimeHours: 0,
    workingDays: 0,
    presentEmployees: 0,
    absentEmployees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.companies?.id) return;

      setLoading(true);
      try {
        const currentMonth = new Date();
        const companyStats = await dataIntegrationService.getCompanyStats(
          userProfile.companies.id, 
          currentMonth
        );
        setStats(companyStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userProfile?.companies?.id]);

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
      change: "+2 this month"
    },
    {
      title: "Average Attendance",
      value: `${stats.averageAttendance}%`,
      icon: Clock,
      color: "bg-green-500",
      change: "+5% from last month"
    },
    {
      title: "Monthly Salary Expense",
      value: formatCurrencySync(stats.totalSalaryExpense),
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+8% from last month"
    },
    {
      title: "Overtime Hours",
      value: stats.totalOvertimeHours,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "-3% from last month"
    }
  ];

  return (
    <Dashboard title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {userProfile?.first_name || "Admin"}! 👋
          </h2>
          <p className="text-white/70">
            Here's what's happening with your company today - {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? "..." : stat.value}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-adicorp-purple" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/70">Present Today:</span>
                <span className="font-semibold text-green-400">
                  {loading ? "..." : stats.presentEmployees}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Absent Today:</span>
                <span className="font-semibold text-red-400">
                  {loading ? "..." : stats.absentEmployees}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Working Days This Month:</span>
                <span className="font-semibold text-blue-400">
                  {loading ? "..." : stats.workingDays}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-adicorp-purple" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => window.location.href = '/employees'}
                className="w-full text-left p-3 rounded-lg bg-adicorp-dark/30 hover:bg-adicorp-dark/50 transition-colors"
              >
                <div className="font-medium">Manage Employees</div>
                <div className="text-sm text-white/60">Add, edit or view employee details</div>
              </button>
              <button 
                onClick={() => window.location.href = '/attendance'}
                className="w-full text-left p-3 rounded-lg bg-adicorp-dark/30 hover:bg-adicorp-dark/50 transition-colors"
              >
                <div className="font-medium">Mark Attendance</div>
                <div className="text-sm text-white/60">Record today's attendance</div>
              </button>
              <button 
                onClick={() => window.location.href = '/working-days'}
                className="w-full text-left p-3 rounded-lg bg-adicorp-dark/30 hover:bg-adicorp-dark/50 transition-colors"
              >
                <div className="font-medium">Working Days Setup</div>
                <div className="text-sm text-white/60">Configure policies and schedules</div>
              </button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-adicorp-purple" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">Latest Updates</div>
                <div className="text-white/60 mt-1">• Salary calculations updated</div>
                <div className="text-white/60">• Working time policies configured</div>
                <div className="text-white/60">• Attendance records synchronized</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Dashboard>
  );
}
