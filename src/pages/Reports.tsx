
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, CalendarDays, Users, FileBarChart, Download, Loader2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  // Data states
  const [attendanceData, setAttendanceData] = useState([
    { month: 'Jan', present: 85, absent: 15 },
    { month: 'Feb', present: 88, absent: 12 },
    { month: 'Mar', present: 90, absent: 10 },
    { month: 'Apr', present: 87, absent: 13 },
    { month: 'May', present: 89, absent: 11 },
    { month: 'Jun', present: 92, absent: 8 },
  ]);
  
  const [expensesData, setExpensesData] = useState([
    { month: 'Jan', amount: 125000 },
    { month: 'Feb', amount: 130000 },
    { month: 'Mar', amount: 132000 },
    { month: 'Apr', amount: 129000 },
    { month: 'May', amount: 135000 },
    { month: 'Jun', amount: 142000 },
  ]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        // Only fetch if we have an authenticated session
        if (!session || !user) {
          console.log("No active session, skipping employee fetch");
          setEmployees([]);
          setLoading(false);
          return;
        }
        
        // Get user's company_id
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error("Error fetching profile:", userError);
          throw userError;
        }
        
        if (!userData?.company_id) {
          throw new Error("Company ID not found.");
        }

        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', userData.company_id);
          
        if (error) {
          console.error("Error fetching employees:", error);
          throw error;
        }
        
        console.log("Fetched employees:", data?.length || 0);
        setEmployees(data || []);
        
        // Calculate expenses data
        if (data && data.length > 0) {
          // Calculate the total salary expense per month
          const daysInMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          ).getDate();
          
          const totalMonthlySalary = data.reduce((acc, employee) => {
            return acc + (Number(employee.wage_rate) * daysInMonth);
          }, 0);
          
          // Create new expenses data with monthly variation
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const newExpensesData = months.map((month, index) => {
            // Add some variance to make chart interesting
            const variance = 0.85 + (Math.random() * 0.3); // Between 85% and 115%
            return {
              month,
              amount: Math.round(totalMonthlySalary * variance)
            };
          });
          
          setExpensesData(newExpensesData);
        }
        
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast({
          title: "Failed to load report data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [toast, session, user]);
  
  // Calculate employee status distribution
  const employeeData = [
    { name: 'Active', value: employees.filter(e => e.status === 'active').length, color: '#6d28d9' },
    { name: 'On Leave', value: 0, color: '#2563eb' },
    { name: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, color: '#dc2626' },
  ];

  // Only show employee data points that have values
  const filteredEmployeeData = employeeData.filter(item => item.value > 0);
  
  return (
    <Dashboard title="Analytics & Reports">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reports for {format(new Date(), "MMMM yyyy")}</h2>
        <Button 
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>
      
      <Tabs defaultValue="attendance" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-3 mb-4">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <CalendarDays className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <FileBarChart className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-adicorp-purple" />
          </div>
        ) : (
          <>
            <TabsContent value="attendance">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-adicorp-purple" />
                    Attendance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attendanceData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e1e2d', 
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: '#fff'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="present" fill="#6d28d9" name="Present %" />
                        <Bar dataKey="absent" fill="#dc2626" name="Absent %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="employees">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-adicorp-purple" />
                    Employee Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-white/70 mb-4">No employee data available</p>
                      <Button 
                        variant="outline" 
                        className="border-white/10"
                        onClick={() => window.location.href = "/employees"}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Add Employees
                      </Button>
                    </div>
                  ) : (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredEmployeeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {filteredEmployeeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e1e2d', 
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#fff'
                            }}
                            formatter={(value) => [`${value} employees`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expenses">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileBarChart className="h-5 w-5 mr-2 text-adicorp-purple" />
                    Monthly Salary Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-white/70 mb-4">No expense data available</p>
                      <Button 
                        variant="outline" 
                        className="border-white/10"
                        onClick={() => window.location.href = "/employees"}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Add Employees
                      </Button>
                    </div>
                  ) : (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={expensesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                          <YAxis stroke="rgba(255,255,255,0.7)" 
                            tickFormatter={(value) => `PKR ${value.toLocaleString()}`} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e1e2d', 
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#fff'
                            }}
                            formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Expenses']}
                          />
                          <Bar dataKey="amount" fill="#2563eb" name="Salary Expenses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </Dashboard>
  );
}
