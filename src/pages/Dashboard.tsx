
import DashboardLayout from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, DollarSign, TrendingUp, Building, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SalaryStats from "@/components/salary/SalaryStats";

export default function Dashboard() {
  const { userProfile } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', userProfile?.company_id],
    queryFn: async () => {
      if (!userProfile?.company_id) return null;

      const [employeesResult, attendanceResult, eventsResult] = await Promise.all([
        supabase
          .from('employees')
          .select('*', { count: 'exact' })
          .eq('company_id', userProfile.company_id)
          .eq('status', 'active'),
        
        supabase
          .from('attendance')
          .select('status', { count: 'exact' })
          .gte('date', new Date().toISOString().split('T')[0])
          .lte('date', new Date().toISOString().split('T')[0]),
        
        supabase
          .from('events')
          .select('*', { count: 'exact' })
          .eq('company_id', userProfile.company_id)
          .gte('date', new Date().toISOString().split('T')[0])
      ]);

      return {
        totalEmployees: employeesResult.count || 0,
        todayAttendance: attendanceResult.count || 0,
        upcomingEvents: eventsResult.count || 0,
        employees: employeesResult.data || []
      };
    },
    enabled: !!userProfile?.company_id
  });

  const StatCard = ({ title, value, icon, description, loading }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    loading?: boolean;
  }) => (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-white/10" />
        ) : (
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
        )}
        {description && (
          <p className="text-xs text-white/60">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section with Logo */}
        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/AdilMunawar-uploads/31e3e556-6bb0-44a2-bd2d-6d5fa04f0ba9.png" 
              alt="AdiCorp Logo" 
              className="w-16 h-16 rounded-full border-2 border-adicorp-purple/30"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-adicorp-purple bg-clip-text text-transparent">
                Welcome to AdiCorp
              </h1>
              <p className="text-white/70 mt-2">
                {userProfile?.companies?.name ? `Managing ${userProfile.companies.name}` : 'Employee Management System'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-adicorp-purple">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Secure • Reliable • Advanced</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={<Users className="h-4 w-4 text-blue-400" />}
            description="Active employees"
            loading={statsLoading}
          />
          <StatCard
            title="Today's Attendance"
            value={stats?.todayAttendance || 0}
            icon={<Calendar className="h-4 w-4 text-green-400" />}
            description="Present today"
            loading={statsLoading}
          />
          <StatCard
            title="Upcoming Events"
            value={stats?.upcomingEvents || 0}
            icon={<TrendingUp className="h-4 w-4 text-purple-400" />}
            description="This month"
            loading={statsLoading}
          />
          <StatCard
            title="Company Status"
            value={userProfile?.companies?.name ? "Active" : "Setup Required"}
            icon={<Building className="h-4 w-4 text-yellow-400" />}
            description={userProfile?.companies?.name || "Complete setup"}
            loading={!userProfile}
          />
        </div>

        {/* Salary Statistics */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Monthly Overview</h2>
          <SalaryStats />
        </div>

        {/* Recent Activity Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-adicorp-purple" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-green-400">System Online</p>
                <p className="text-xs text-white/60">All services operational</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-blue-400">Data Synced</p>
                <p className="text-xs text-white/60">Real-time updates active</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-purple-400">Secure</p>
                <p className="text-xs text-white/60">Protected by encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
