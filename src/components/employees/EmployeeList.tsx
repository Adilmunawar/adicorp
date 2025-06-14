
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
  Loader2,
  RefreshCcw,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/salaryCalculations";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmployeeImportExport from "./EmployeeImportExport";

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (id: string) => void;
}

export default function EmployeeList({ onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, session, userProfile } = useAuth();
  
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
      
      if (!userProfile?.company_id) {
        console.log("No company ID found in user profile, skipping employee fetch");
        setEmployees([]);
        setLoading(false);
        return;
      }
      
      console.log("Fetching employees for company:", userProfile.company_id);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', userProfile.company_id)
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
        title: "Failed to load employees",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployees();
    }
    
    // Set up real-time subscription if we have a session
    let channel;
    if (session && userProfile?.company_id) {
      channel = supabase
        .channel('employee-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public',
          table: 'employees',
          filter: `company_id=eq.${userProfile.company_id}`
        }, () => {
          console.log("Employee data changed, refreshing...");
          fetchEmployees();
        })
        .subscribe();
        
      console.log("Realtime subscription set up for employees table with company filter");
    }
      
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userProfile, session, user]);
  
  const confirmDelete = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      if (!session || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Deleting employee:", employeeToDelete);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeToDelete);
        
      if (error) {
        console.error("Error deleting employee:", error);
        throw error;
      }
      
      sonnerToast.success("Employee deleted", {
        description: "Employee has been successfully removed."
      });
      
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Failed to delete employee",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    fetchEmployees();
  };

  const showNoCompanyMessage = session && user && userProfile && !userProfile.company_id;

  return (
    <>
      <Card className="glass-card w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              <span>All Employees</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2" 
                onClick={() => fetchEmployees()}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Manage your workforce and team members
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setImportExportDialogOpen(true)}
              className="border-white/20 hover:bg-adicorp-dark/30"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import/Export
            </Button>
            <Button 
              onClick={onAddEmployee}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
            </div>
          ) : showNoCompanyMessage ? (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Company Setup Required</h3>
              <p className="text-white/70 mb-4">You need to set up your company before you can add employees.</p>
              <Button 
                variant="default"
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                onClick={() => window.location.href = '/settings'}
              >
                Go to Company Setup
              </Button>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <p>No employees found. Add your first employee to get started.</p>
            </div>
          ) : (
            <div className="rounded-md overflow-hidden">
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
                                onClick={() => confirmDelete(employee.id)}
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
            </div>
          )}
          
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="bg-adicorp-dark-light border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete this employee and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-adicorp-dark">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteEmployee}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Dialog open={importExportDialogOpen} onOpenChange={setImportExportDialogOpen}>
        <DialogContent className="bg-adicorp-dark-light border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import/Export Employees</DialogTitle>
          </DialogHeader>
          <EmployeeImportExport 
            onImportComplete={() => {
              fetchEmployees();
              setImportExportDialogOpen(false);
            }}
            employees={employees}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
