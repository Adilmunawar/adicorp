
import { useState, useEffect } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash, 
  UserPlus,
  ChevronDown,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/types/supabase";

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (id: string) => void;
}

export default function EmployeeList({ onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Failed to load employees",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('employee-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'employees' 
      }, () => {
        fetchEmployees();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Employee deleted",
        description: "Employee has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Failed to delete employee",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Employees</CardTitle>
        <Button 
          onClick={onAddEmployee}
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No employees found. Add your first employee to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Daily Wage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className={
                        employee.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {employee.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditEmployee(employee.id)}
                      >
                        <Edit size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-adicorp-dark-light border-white/10">
                          <DropdownMenuItem 
                            className="text-red-400 focus:text-red-400 cursor-pointer"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash size={16} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
