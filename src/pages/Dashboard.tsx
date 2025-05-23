
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/types/supabase";
import { Users, Clock, CalendarCheck, AlertCircle, Building } from "lucide-react";
import CompanySetupForm from "@/components/company/CompanySetupForm";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { toast } = useToast();
  const { session, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    dailyAttendance: 0,
    monthlyExpenses: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!session) return;
        
        setLoading(true);
        
        // First check if the user has a company set up
        if (!userProfile?.company_id) {
          setNeedsCompanySetup(true);
          setLoading(false);
          return;
        } else {
          setNeedsCompanySetup(false);
        }
        
        // Fetch employee stats
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, status, wage_rate')
          .eq('company_id', userProfile.company_id);
          
        if (employeeError) throw employeeError;
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id')
          .eq('date', today)
          .in('employee_id', employeeData?.map(emp => emp.id) || [])
          .eq('status', 'present');
          
        if (attendanceError && attendanceError.code !== 'PGRST116') throw attendanceError;
        
        // Calculate statistics
        const totalEmployees = employeeData?.length || 0;
        const activeEmployees = employeeData?.filter(emp => emp.status === 'active').length || 0;
        const dailyAttendance = attendanceData?.length || 0;
        
        // Calculate monthly expenses (simple estimation based on wage rate * 30 days)
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
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast, session, userProfile]);
  
  const handleCompanySetupComplete = () => {
    setNeedsCompanySetup(false);
    window.location.reload(); // Reload to update all data
  };
  
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
  
  return (
    <Dashboard title="Dashboard">
      {needsCompanySetup ? (
        <div className="max-w-md mx-auto">
          <CompanySetupForm 
            isOpen={needsCompanySetup}
            onComplete={handleCompanySetupComplete}
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </Dashboard>
  );
}
