
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRow, EmployeeInsert } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string; // If provided, we're editing an existing employee
}

// Mock ranks
const ranks = [
  "Data Entry Operator",
  "Customer Service",
  "Supervisor",
  "Manager",
  "Accountant",
  "HR Specialist",
  "Marketing Specialist",
];

export default function EmployeeForm({ isOpen, onClose, employeeId }: EmployeeFormProps) {
  const isEditing = !!employeeId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { user, session } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Initial form state
  const [formData, setFormData] = useState<Omit<EmployeeInsert, 'id' | 'created_at' | 'company_id' | 'user_id'>>({
    name: "",
    rank: "",
    wage_rate: 0,
    status: "active"
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({
    name: "",
    rank: "",
    wage_rate: ""
  });

  // Fetch company ID when form is opened
  useEffect(() => {
    const fetchUserCompanyId = async () => {
      try {
        if (!session || !user) return;
        
        console.log("Fetching user company ID");
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user profile:", error);
          throw error;
        }
        
        console.log("User company ID:", data?.company_id);
        setCompanyId(data?.company_id);
      } catch (error) {
        console.error("Error fetching company ID:", error);
      }
    };
    
    fetchUserCompanyId();
  }, [user, session]);
  
  useEffect(() => {
    // Reset form when dialog opens/closes
    if (!isOpen) {
      setFormData({
        name: "",
        rank: "",
        wage_rate: 0,
        status: "active"
      });
      setFormErrors({
        name: "",
        rank: "",
        wage_rate: ""
      });
      return;
    }
    
    // Fetch employee data if editing
    if (isOpen && isEditing && employeeId) {
      const fetchEmployee = async () => {
        try {
          setIsFetching(true);

          // Check for session first
          if (!session || !user) {
            toast({
              title: "Authentication required",
              description: "Please log in to perform this action.",
              variant: "destructive",
            });
            onClose();
            return;
          }

          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();
            
          if (error) {
            console.error("Error fetching employee:", error);
            throw error;
          }
          
          if (data) {
            setFormData({
              name: data.name,
              rank: data.rank,
              wage_rate: Number(data.wage_rate),
              status: data.status
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
  }, [isOpen, isEditing, employeeId, toast, onClose, session, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "wage_rate" ? Number(value) : value 
    }));
    
    // Clear error when field is updated
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      name: "",
      rank: "",
      wage_rate: ""
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.rank) {
      errors.rank = "Position is required";
      isValid = false;
    }

    if (!formData.wage_rate || formData.wage_rate <= 0) {
      errors.wage_rate = "Valid wage rate is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify we have an active session
      if (!session || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if we have a company ID
      if (!companyId) {
        toast({
          title: "Company ID not found",
          description: "Please set up your company first.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Submitting employee form with company_id:", companyId);
      
      if (isEditing && employeeId) {
        // Update existing employee
        console.log("Updating employee:", employeeId);
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            rank: formData.rank,
            wage_rate: formData.wage_rate,
            status: formData.status
          })
          .eq('id', employeeId);
          
        if (error) {
          console.error("Error updating employee:", error);
          throw error;
        }
        
        sonnerToast.success("Employee updated", {
          description: "Employee information has been updated successfully."
        });
      } else {
        // Create new employee
        console.log("Creating new employee with company_id:", companyId);
        const { error } = await supabase
          .from('employees')
          .insert({
            name: formData.name,
            rank: formData.rank,
            wage_rate: formData.wage_rate,
            status: formData.status,
            company_id: companyId
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
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
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
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
            {formErrors.name && (
              <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rank">Rank/Position</Label>
            <Select 
              onValueChange={(value) => handleSelectChange("rank", value)}
              value={formData.rank}
            >
              <SelectTrigger className="bg-adicorp-dark/60 border-white/10">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent className="bg-adicorp-dark-light border-white/10">
                {ranks.map((rank) => (
                  <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.rank && (
              <p className="text-red-400 text-xs mt-1">{formErrors.rank}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wageRate">Daily Wage Rate (PKR)</Label>
            <Input
              id="wage_rate"
              name="wage_rate"
              type="number"
              value={formData.wage_rate}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
            {formErrors.wage_rate && (
              <p className="text-red-400 text-xs mt-1">{formErrors.wage_rate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => handleSelectChange("status", value)}
              value={formData.status}
            >
              <SelectTrigger className="bg-adicorp-dark/60 border-white/10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-adicorp-dark-light border-white/10">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="border-white/10 hover:bg-adicorp-dark"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
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
      </DialogContent>
    </Dialog>
  );
}
