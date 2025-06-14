
import { useEffect, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Users, Clock, DollarSign, TrendingUp, Calendar, Shield } from "lucide-react";
import { dataIntegrationService } from "@/services/dataIntegrationService";
import { format } from "date-fns";
import { formatCurrencySync } from "@/utils/salaryCalculations";
import { useCurrency } from "@/hooks/useCurrency";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.companies?.id) return;

      setLoading(true);
      setError(null);
      try {
        const currentMonth = new Date();
        const companyStats = await dataIntegrationService.getCompanyStats(
          userProfile.companies.id, 
          currentMonth
        );
        setStats(companyStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
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
      change: "+2 this month",
      trend: "up"
    },
    {
      title: "Average Attendance",
      value: `${stats.averageAttendance}%`,
      icon: Clock,
      color: "bg-green-500",
      change: "+5% from last month",
      trend: "up"
    },
    {
      title: "Monthly Salary Expense",
      value: formatCurrencySync(stats.totalSalaryExpense),
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+8% from last month",
      trend: "up"
    },
    {
      title: "Overtime Hours",
      value: stats.totalOvertimeHours,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "-3% from last month",
      trend: "down"
    }
  ];

  if (loading) {
    return (
      <Dashboard title="Dashboard">
        <ResponsiveContainer>
          <LoadingSkeleton type="dashboard" />
        </ResponsiveContainer>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard title="Dashboard">
        <ResponsiveContainer>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-adicorp-purple rounded-lg hover:bg-adicorp-purple-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </ResponsiveContainer>
      </Dashboard>
    );
  }

  return (
    <Dashboard title="Dashboard">
      <ErrorBoundary>
        <ResponsiveContainer>
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="glass-card p-4 md:p-6 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Welcome back, {userProfile?.first_name || "Admin"}! 👋
              </h2>
              <p className="text-white/70 text-sm md:text-base">
                Here's what's happening with your company today - {format(new Date(), 'MMMM dd, yyyy')}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statCards.map((stat, index) => (
                <Card 
                  key={index} 
                  className="glass-card hover:shadow-lg transition-all duration-200 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-white/80 line-clamp-2">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                      <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <p className={`text-xs text-white/60 flex items-center gap-1 ${
                      stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span className={stat.trend === 'up' ? '↗' : '↘'} />
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Today's Overview */}
              <Card className="glass-card hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm md:text-base">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2 text-adicorp-purple" />
                    Today's Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Present Today:</span>
                    <span className="font-semibold text-green-400 text-sm md:text-base">
                      {stats.presentEmployees}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Absent Today:</span>
                    <span className="font-semibold text-red-400 text-sm md:text-base">
                      {stats.absentEmployees}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Working Days This Month:</span>
                    <span className="font-semibold text-blue-400 text-sm md:text-base">
                      {stats.workingDays}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm md:text-base">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2 text-adicorp-purple" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { href: '/employees', title: 'Manage Employees', desc: 'Add, edit or view employee details' },
                    { href: '/attendance', title: 'Mark Attendance', desc: 'Record today\'s attendance' },
                    { href: '/working-days', title: 'Working Days Setup', desc: 'Configure policies and schedules' }
                  ].map((action, index) => (
                    <button 
                      key={index}
                      onClick={() => window.location.href = action.href}
                      className="w-full text-left p-3 rounded-lg bg-adicorp-dark/30 hover:bg-adicorp-dark/50 transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-adicorp-purple/50"
                      aria-label={action.title}
                    >
                      <div className="font-medium text-sm md:text-base">{action.title}</div>
                      <div className="text-xs md:text-sm text-white/60">{action.desc}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm md:text-base">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mr-2 text-adicorp-purple" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Latest Updates</div>
                    <div className="space-y-1 text-white/60">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-xs md:text-sm">Salary calculations updated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-xs md:text-sm">Working time policies configured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-xs md:text-sm">Attendance records synchronized</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ResponsiveContainer>
      </ErrorBoundary>
    </Dashboard>
  );
}
