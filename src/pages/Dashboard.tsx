
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BarChart, ChartPie } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

// Updated statistics type with PKR formatting
type Stat = {
  id: number;
  title: string;
  value: string | number;
  icon: React.ElementType;
  change: number;
  color: string;
};

const DashboardPage = () => {
  const [stats, setStats] = useState<Stat[]>([
    { id: 1, title: "Total Employees", value: 0, icon: Users, change: 0, color: "bg-adicorp-purple" },
    { id: 2, title: "Present Today", value: 0, icon: Clock, change: 0, color: "bg-green-500" },
    { id: 3, title: "Total Salary", value: "PKR 0", icon: BarChart, change: 0, color: "bg-blue-500" },
    { id: 4, title: "Productivity", value: "0%", icon: ChartPie, change: 0, color: "bg-yellow-500" },
  ]);
  const [attendanceStats, setAttendanceStats] = useState({
    fullAttendance: 0,
    shortLeaves: 0,
    fullLeaves: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch employees
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('*');
        
        if (employeesError) throw employeesError;
        
        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('date', today);
          
        if (attendanceError) throw attendanceError;
        
        // Calculate total salary (wage_rate is daily wage)
        const totalSalary = employees?.reduce((sum, emp) => sum + Number(emp.wage_rate), 0) || 0;
        const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0;
        const productivityPercent = employees?.length ? Math.round((presentToday / employees.length) * 100) : 0;
        
        // Calculate attendance stats
        const totalAttendanceRecords = todayAttendance?.length || 0;
        const fullAttendance = todayAttendance?.filter(a => a.status === 'present').length || 0;
        const shortLeaves = todayAttendance?.filter(a => a.status === 'short_leave').length || 0;
        const fullLeaves = todayAttendance?.filter(a => a.status === 'leave').length || 0;
        
        // Update stats
        setStats([
          { id: 1, title: "Total Employees", value: employees?.length || 0, icon: Users, change: 2, color: "bg-adicorp-purple" },
          { id: 2, title: "Present Today", value: presentToday, icon: Clock, change: totalAttendanceRecords ? 0 : -1, color: "bg-green-500" },
          { id: 3, title: "Total Salary", value: formatCurrency(totalSalary * 30), icon: BarChart, change: 5, color: "bg-blue-500" },
          { id: 4, title: "Productivity", value: `${productivityPercent}%`, icon: ChartPie, change: 3, color: "bg-yellow-500" },
        ]);
        
        // Update attendance stats
        setAttendanceStats({
          fullAttendance: totalAttendanceRecords ? (fullAttendance / totalAttendanceRecords) * 100 : 0,
          shortLeaves: totalAttendanceRecords ? (shortLeaves / totalAttendanceRecords) * 100 : 0,
          fullLeaves: totalAttendanceRecords ? (fullLeaves / totalAttendanceRecords) * 100 : 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'employees' 
      }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'attendance' 
      }, () => {
        fetchDashboardData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <Dashboard title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.id} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-xs mt-2 ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}% from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Monthly Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Full Attendance</span>
                  <span className="text-sm font-medium">{Math.round(attendanceStats.fullAttendance)}%</span>
                </div>
                <Progress value={attendanceStats.fullAttendance} className="h-2 bg-adicorp-dark" indicatorClassName="bg-adicorp-purple" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Short Leaves</span>
                  <span className="text-sm font-medium">{Math.round(attendanceStats.shortLeaves)}%</span>
                </div>
                <Progress value={attendanceStats.shortLeaves} className="h-2 bg-adicorp-dark" indicatorClassName="bg-yellow-500" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Full Leaves</span>
                  <span className="text-sm font-medium">{Math.round(attendanceStats.fullLeaves)}%</span>
                </div>
                <Progress value={attendanceStats.fullLeaves} className="h-2 bg-adicorp-dark" indicatorClassName="bg-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start pb-4 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-adicorp-purple mr-3" />
                  <div>
                    <p className="text-sm font-medium">
                      {["New employee added", "Attendance updated", "Salary processed"][i]}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {["2 hours ago", "5 hours ago", "Yesterday"][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
};

export default DashboardPage;
