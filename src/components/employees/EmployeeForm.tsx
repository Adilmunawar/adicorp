
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
}

const ranks = [
  "Data Entry Operator",
  "Customer Service",
  "Supervisor",
  "Manager",
  "Accountant",
  "HR Specialist",
  "Marketing Specialist",
  "Developer",
  "Designer",
  "Executive"
];

const employeeSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  rank: z.string().min(1, { message: "Rank is required" }),
  monthly_salary: z.coerce.number().min(1, { message: "Monthly salary must be greater than 0" }),
  status: z.enum(["active", "inactive"])
});

type FormValues = z.infer<typeof employeeSchema>;

export default function EmployeeForm({ isOpen, onClose, employeeId }: EmployeeFormProps) {
  const isEditing = !!employeeId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { user, session, userProfile } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      rank: "",
      monthly_salary: 0,
      status: "active"
    }
  });

  const hasCompany = !!userProfile?.company_id;
  
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        rank: "",
        monthly_salary: 0,
        status: "active"
      });
      return;
    }
    
    if (isOpen && isEditing && employeeId) {
      const fetchEmployee = async () => {
        try {
          setIsFetching(true);

          if (!session || !user) {
            toast({
              title: "Authentication required",
              description: "Please log in to perform this action.",
              variant: "destructive",
            });
            onClose();
            return;
          }

          console.log("Fetching employee with ID:", employeeId, "for company:", userProfile?.company_id);
          
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .eq('company_id', userProfile?.company_id)
            .single();
            
          if (error) {
            console.error("Error fetching employee:", error);
            throw error;
          }
          
          if (data) {
            form.reset({
              name: data.name,
              rank: data.rank,
              monthly_salary: Number(data.wage_rate),
              status: data.status as "active" | "inactive"
            });
          }
        } catch (error) {
          console.error("Error fetching employee:", error);
          toast({
            title: "Failed to load employee data",
            description: "Please try again.",
            variant: "destructive",
          });
          onClose();
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchEmployee();
    }
  }, [isOpen, isEditing, employeeId, toast, onClose, session, user, form, userProfile?.company_id]);
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      if (!session || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      if (!userProfile?.company_id) {
        toast({
          title: "Company ID not found",
          description: "Please set up your company first in Settings.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Submitting employee form with company_id:", userProfile.company_id);
      
      if (isEditing && employeeId) {
        console.log("Updating employee:", employeeId);
        const { error } = await supabase
          .from('employees')
          .update({
            name: values.name,
            rank: values.rank,
            wage_rate: values.monthly_salary,
            status: values.status
          })
          .eq('id', employeeId)
          .eq('company_id', userProfile.company_id);
          
        if (error) {
          console.error("Error updating employee:", error);
          throw error;
        }
        
        sonnerToast.success("Employee updated", {
          description: "Employee information has been updated successfully."
        });
      } else {
        console.log("Creating new employee with company_id:", userProfile.company_id);
        const { error } = await supabase
          .from('employees')
          .insert({
            name: values.name,
            rank: values.rank,
            wage_rate: values.monthly_salary,
            status: values.status,
            company_id: userProfile.company_id
          });
          
        if (error) {
          console.error("Error creating employee:", error);
          throw error;
        }
        
        sonnerToast.success("Employee added", {
          description: "New employee has been added successfully."
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast({
        title: "Failed to save employee",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCompanySetupNeeded = () => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
        <div className="text-center py-6">
          <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Company Setup Required</h2>
          <p className="text-white/70 mb-4">
            You need to set up your company information before you can add employees.
          </p>
          <Button 
            variant="default"
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
            onClick={() => {
              onClose();
              window.location.href = '/settings';
            }}
          >
            Go to Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  if (!hasCompany) {
    return renderCompanySetupNeeded();
  }
  
  if (isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update employee information below"
              : "Enter employee details to add them to your team"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. John Smith"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank/Position</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-adicorp-dark/60 border-white/10">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-adicorp-dark-light border-white/10 z-[60]">
                      {ranks.map((rank) => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="monthly_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Salary (PKR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. 45000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-adicorp-dark/60 border-white/10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-adicorp-dark-light border-white/10 z-[60]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="border-white/10 hover:bg-adicorp-dark"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditing ? "Update Employee" : "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
