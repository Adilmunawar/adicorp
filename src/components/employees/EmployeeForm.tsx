
import { useState } from "react";
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
  
  // Initial form state
  const [formData, setFormData] = useState({
    name: "",
    rank: "",
    wageRate: "",
    status: "active"
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    // In a real app, this would create/update an employee in Supabase
    console.log("Submitting employee data:", formData);
    onClose();
  };
  
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wageRate">Daily Wage Rate ($)</Label>
            <Input
              id="wageRate"
              name="wageRate"
              type="number"
              value={formData.wageRate}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => handleSelectChange("status", value)}
              defaultValue={formData.status}
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
            className="border-white/10 hover:bg-adicorp-dark"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          >
            {isEditing ? "Update Employee" : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
