
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/types/supabase";
import { Users, Clock, CalendarCheck, AlertCircle, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { toast } = useToast();
  const { session, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    dailyAttendance: 0,
    monthlyExpenses: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (authLoading || !session || !userProfile?.company_id) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log("Dashboard - Fetching dashboard stats for company:", userProfile.company_id);
        
        // Fetch employees
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, status, wage_rate')
          .eq('company_id', userProfile.company_id);
          
        if (employeeError) {
          console.error("Dashboard - Error fetching employees:", employeeError);
          throw employeeError;
        }
        
        const totalEmployees = employeeData?.length || 0;
        const activeEmployees = employeeData?.filter(emp => emp.status === 'active').length || 0;
        
        let dailyAttendance = 0;
        
        // Only fetch attendance if we have employees
        if (totalEmployees > 0) {
          const today = new Date().toISOString().split('T')[0];
          
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('id')
            .eq('date', today)
            .in('employee_id', employeeData.map(emp => emp.id))
            .eq('status', 'present');
            
          if (attendanceError && attendanceError.code !== 'PGRST116') {
            console.error("Dashboard - Error fetching attendance:", attendanceError);
          } else {
            dailyAttendance = attendanceData?.length || 0;
          }
        }
        
        const monthlyExpenses = employeeData?.reduce((sum, emp) => {
          if (emp.status === 'active') {
            return sum + (Number(emp.wage_rate) * 30);
          }
          return sum;
        }, 0) || 0;
        
        setStats({
          totalEmployees,
          activeEmployees,
          dailyAttendance,
          monthlyExpenses
        });
        
        console.log("Dashboard - Stats loaded successfully:", {
          totalEmployees,
          activeEmployees,
          dailyAttendance,
          monthlyExpenses
        });
        
      } catch (error) {
        console.error("Dashboard - Error loading data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast, session, userProfile, authLoading]);
  
  const renderCompanyInfo = () => {
    if (!userProfile?.companies) return null;
    
    return (
      <Card className="glass-card mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-medium flex items-center">
            <Building className="h-5 w-5 mr-2 text-adicorp-purple" />
            {userProfile.companies.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {userProfile.companies.address && (
              <div>Address: {userProfile.companies.address}</div>
            )}
            {userProfile.companies.phone && (
              <div>Phone: {userProfile.companies.phone}</div>
            )}
            {userProfile.companies.website && (
              <div>
                Website: <a 
                  href={userProfile.companies.website.startsWith('http') ? userProfile.companies.website : `https://${userProfile.companies.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-adicorp-purple hover:underline"
                >
                  {userProfile.companies.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  if (authLoading || loading) {
    return (
      <Dashboard title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adicorp-purple mx-auto"></div>
            <p className="mt-4 text-white/60">Loading dashboard...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  // Show message if no company is set up
  if (!userProfile?.company_id) {
    return (
      <Dashboard title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building className="h-16 w-16 text-adicorp-purple mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Company Setup Required</h2>
            <p className="text-white/60 mb-4">Please complete your company setup to access the dashboard.</p>
          </div>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="Dashboard">
      {renderCompanyInfo()}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-adicorp-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-white/60 mt-1">
              {stats.activeEmployees} active employees
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Attendance
            </CardTitle>
            <Clock className="h-4 w-4 text-adicorp-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyAttendance}</div>
            <p className="text-xs text-white/60 mt-1">
              {stats.totalEmployees > 0
                ? `${Math.round((stats.dailyAttendance / stats.totalEmployees) * 100)}% attendance rate`
                : "No employees recorded"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-adicorp-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyExpenses)}
            </div>
            <p className="text-xs text-white/60 mt-1">
              Estimated 30-day expense
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Actions
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-adicorp-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-white/60 mt-1">
              No pending actions
            </p>
          </CardContent>
        </Card>
      </div>
      
      {stats.totalEmployees === 0 && (
        <div className="mt-8 text-center">
          <Card className="glass-card inline-block p-8">
            <h3 className="text-xl font-semibold mb-2">Get Started With Your Team</h3>
            <p className="text-white/70 mb-4">
              You haven't added any employees yet. Start building your team now.
            </p>
            <Button 
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
              onClick={() => window.location.href = '/employees'}
            >
              Add Employees
            </Button>
          </Card>
        </div>
      )}
    </Dashboard>
  );
}
