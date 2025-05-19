
import { useState, useEffect } from "react";
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
  CircleDollarSign, 
  Calendar, 
  Download,
  FileSpreadsheet,
  Briefcase,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { formatCurrency } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function SalaryPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState("salary-sheet");
  
  // Current month name and year
  const currentMonth = format(new Date(), "MMMM yyyy");
  
  // Calculate days in current month
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  
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
        
        console.log("Fetching user profile to get company ID");
        
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
        
        console.log("Fetching employees for company:", userData.company_id);
        
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', userData.company_id)
          .eq('status', 'active')
          .order('name');
          
        if (error) {
          console.error("Error fetching employees:", error);
          throw error;
        }
        
        console.log("Fetched employees:", data?.length || 0);
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Failed to load employee data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [toast, session, user]);
  
  // Calculate total monthly salary
  const totalSalary = employees.reduce((total, employee) => {
    return total + (Number(employee.wage_rate) * daysInMonth);
  }, 0);
  
  // Calculate average daily wage
  const averageDailyWage = employees.length > 0 
    ? employees.reduce((total, employee) => total + Number(employee.wage_rate), 0) / employees.length
    : 0;
  
  return (
    <Dashboard title="Salary Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Total Monthly Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CircleDollarSign className="h-5 w-5 mr-2 text-green-400" />
              <span className="text-2xl font-bold">
                {formatCurrency(totalSalary)}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              For {employees.length} active employees
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Pay Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              <span className="text-2xl font-bold">
                {currentMonth}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {daysInMonth} working days
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Average Daily Wage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
              <span className="text-2xl font-bold">
                {formatCurrency(averageDailyWage)}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Per employee per day
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="salary-sheet" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-2 mb-4">
          <TabsTrigger value="salary-sheet" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Salary Sheet
          </TabsTrigger>
          <TabsTrigger value="payslips" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Download className="h-4 w-4 mr-2" />
            Payslips
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="salary-sheet">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Salary Sheet - {currentMonth}</CardTitle>
              <Button 
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No active employees found. Add employees to generate salary sheets.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Daily Rate</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow 
                        key={employee.id} 
                        className="border-white/10 hover:bg-adicorp-dark/30"
                      >
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.rank}</TableCell>
                        <TableCell>{formatCurrency(Number(employee.wage_rate))}</TableCell>
                        <TableCell>{daysInMonth}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(Number(employee.wage_rate) * daysInMonth)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payslips">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Individual Payslips - {currentMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <p>No active employees found. Add employees to generate payslips.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <Card key={employee.id} className="bg-adicorp-dark-light/40 border-white/5">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{employee.name}</CardTitle>
                            <p className="text-sm text-white/60">{employee.rank}</p>
                          </div>
                          <Button size="sm" variant="outline" className="border-white/10 hover:bg-adicorp-dark">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Daily Rate:</span>
                            <span>{formatCurrency(Number(employee.wage_rate))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Working Days:</span>
                            <span>{daysInMonth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Deductions:</span>
                            <span>{formatCurrency(0)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                            <span>Net Salary:</span>
                            <span className="text-green-400">
                              {formatCurrency(Number(employee.wage_rate) * daysInMonth)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
