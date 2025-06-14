import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  UserCheck, 
  UserX, 
  Download,
  Upload,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from "./EmployeeForm";
import EmployeeImportExport from "./EmployeeImportExport";
import { formatCurrencySync } from "@/utils/salaryCalculations";

interface Employee {
  id: string;
  name: string;
  rank: string;
  wage_rate: number;
  status: string;
  user_id: string;
  company_id: string;
  created_at: string;
}

interface EmployeeListProps {
  onAddEmployee?: () => void;
  onEditEmployee?: (id: string) => void;
}

export default function EmployeeList({ onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployees();
    }
  }, [userProfile?.company_id]);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.rank.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    if (onAddEmployee) {
      onAddEmployee();
    } else {
      setEditingEmployee(null);
      setShowForm(true);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    if (onEditEmployee) {
      onEditEmployee(employee.id);
    } else {
      setEditingEmployee(employee);
      setShowForm(true);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== employeeId));
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employee.id);

      if (error) throw error;

      setEmployees(employees.map(emp => 
        emp.id === employee.id ? { ...emp, status: newStatus } : emp
      ));

      toast({
        title: "Success",
        description: `Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating employee status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee status",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const totalSalaryBudget = activeEmployees.reduce((sum, emp) => sum + emp.wage_rate, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-adicorp-purple mx-auto" />
          <p className="mt-4 text-white/60">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.company_id) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">Please complete company setup to manage employees.</p>
        <Button 
          onClick={() => window.location.href = '/settings'}
          className="mt-4 bg-adicorp-purple hover:bg-adicorp-purple-dark"
        >
          Go to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-white/60">
              {activeEmployees.length} active, {employees.length - activeEmployees.length} inactive
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {activeEmployees.length}
            </div>
            <p className="text-xs text-white/60">Currently working</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">
              Monthly Salary Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrencySync(totalSalaryBudget)}
            </div>
            <p className="text-xs text-white/60">For active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Employee Management */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Employee Management</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowImportExport(true)}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-adicorp-dark"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
              <Button
                onClick={handleAddEmployee}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Search employees by name or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-adicorp-dark border-white/10"
              />
            </div>
          </div>

          {/* Employee Table */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              {employees.length === 0 ? (
                <div>
                  <p className="mb-2">No employees found. Start by adding your first employee.</p>
                  <Button
                    onClick={handleAddEmployee}
                    className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Employee
                  </Button>
                </div>
              ) : (
                <p>No employees match your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Monthly Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className="border-white/10 hover:bg-adicorp-dark/30"
                    >
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.rank}</TableCell>
                      <TableCell className="font-mono">
                        {formatCurrencySync(employee.wage_rate)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            employee.status === 'active' 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(employee)}
                            className="border-white/10 hover:bg-adicorp-dark"
                          >
                            {employee.status === 'active' ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEmployee(employee)}
                            className="border-white/10 hover:bg-adicorp-dark"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-adicorp-dark border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {employee.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/10 hover:bg-adicorp-dark">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          employeeId={editingEmployee?.id}
        />
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <EmployeeImportExport
          onImportComplete={() => {
            setShowImportExport(false);
            fetchEmployees();
          }}
          employees={employees}
        />
      )}
    </div>
  );
}
