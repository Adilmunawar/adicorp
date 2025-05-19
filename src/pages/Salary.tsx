
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarIcon, 
  Loader2, 
  Download 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/types/supabase";
import { EmployeeRow } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function SalaryPage() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Working days in month (excluding weekends)
  const [workingDays, setWorkingDays] = useState(22);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Get user's company_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (!profileData.company_id) {
          toast({
            title: "Company not found",
            description: "Please set up your company first.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Fetch active employees
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', profileData.company_id)
          .eq('status', 'active')
          .order('name');
          
        if (employeeError) throw employeeError;
        
        setEmployees(employeeData || []);
        
        // Calculate working days for selected month
        calculateWorkingDays(selectedMonth, selectedYear);
        
      } catch (error) {
        console.error("Error fetching salary data:", error);
        toast({
          title: "Failed to load salary data",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [session, toast, selectedMonth, selectedYear]);
  
  const calculateWorkingDays = (month: number, year: number) => {
    // Calculate working days (excluding weekends)
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const day = date.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (day !== 0 && day !== 6) {
        workDays++;
      }
    }
    
    setWorkingDays(workDays);
  };
  
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value));
  };
  
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };
  
  const calculateSalary = (wageRate: number) => {
    return wageRate * workingDays;
  };
  
  const calculateTotalSalary = () => {
    return employees.reduce((total, employee) => {
      return total + calculateSalary(Number(employee.wage_rate));
    }, 0);
  };
  
  const handleExportSalarySheet = () => {
    // Export functionality (future implementation)
    toast({
      title: "Export feature coming soon",
      description: "This feature will be available in a future update.",
    });
  };
  
  return (
    <Dashboard title="Salary Management">
      <div className="space-y-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Salary Sheet</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  className="bg-adicorp-dark/60 border border-white/10 rounded px-3 py-2 text-sm"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                
                <select
                  className="bg-adicorp-dark/60 border border-white/10 rounded px-3 py-2 text-sm"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <Button 
                variant="outline" 
                className="flex items-center border-white/10"
                onClick={handleExportSalarySheet}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                <p>No active employees found. Add employees to manage salaries.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-white/70">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Working Days: {workingDays} days</span>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Daily Rate</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow 
                        key={employee.id}
                        className="border-white/10 hover:bg-adicorp-dark/30"
                      >
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.rank}</TableCell>
                        <TableCell>{formatCurrency(Number(employee.wage_rate))}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(calculateSalary(Number(employee.wage_rate)))}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow className="border-white/10 bg-adicorp-dark/40">
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total Monthly Expenses:
                      </TableCell>
                      <TableCell className="font-bold text-adicorp-purple">
                        {formatCurrency(calculateTotalSalary())}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
