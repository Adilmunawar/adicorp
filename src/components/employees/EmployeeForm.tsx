
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { toast } from "sonner";
import { UserPlus, Save } from "lucide-react";
import type { EmployeeRow } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rank: z.string().min(1, "Rank is required"), 
  wage_rate: z.number().min(0, "Wage rate must be positive"),
  status: z.enum(["active", "inactive"]).default("active"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: EmployeeRow | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  employeeId?: string;
}

export default function EmployeeForm({ 
  employee, 
  onSuccess, 
  onCancel, 
  isOpen, 
  onClose,
  employeeId 
}: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { logEmployeeActivity } = useActivityLogger();

  // Fetch employee data if we have an employeeId but no employee data
  const { data: fetchedEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId || !userProfile?.company_id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('company_id', userProfile.company_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId && !employee && !!userProfile?.company_id,
  });

  const currentEmployee = employee || fetchedEmployee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      rank: "",
      wage_rate: 0,
      status: "active",
    },
  });

  // Reset form when employee data changes
  useEffect(() => {
    if (currentEmployee) {
      form.reset({
        name: currentEmployee.name || "",
        rank: currentEmployee.rank || "",
        wage_rate: currentEmployee.wage_rate || 0,
        status: currentEmployee.status === "inactive" ? "inactive" : "active",
      });
    } else {
      form.reset({
        name: "",
        rank: "",
        wage_rate: 0,
        status: "active",
      });
    }
  }, [currentEmployee, form]);

  const handleSubmit = async (data: EmployeeFormData) => {
    if (!userProfile?.company_id) {
      toast.error("Company setup required");
      return;
    }

    setLoading(true);
    try {
      if (currentEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({
            name: data.name,
            rank: data.rank,
            wage_rate: data.wage_rate,
            status: data.status,
          })
          .eq("id", currentEmployee.id);

        if (error) throw error;

        await logEmployeeActivity('update', data.name, {
          employee_id: currentEmployee.id,
          previous_name: currentEmployee.name,
          previous_rank: currentEmployee.rank,
          previous_wage_rate: currentEmployee.wage_rate,
          new_rank: data.rank,
          new_wage_rate: data.wage_rate,
          status_change: currentEmployee.status !== data.status ? `${currentEmployee.status} → ${data.status}` : 'No change'
        });

        toast.success(`Employee ${data.name} updated successfully`);
      } else {
        // Create new employee
        const { data: newEmployee, error } = await supabase
          .from("employees")
          .insert({
            company_id: userProfile.company_id,
            name: data.name,
            rank: data.rank,
            wage_rate: data.wage_rate,
            status: data.status,
          })
          .select()
          .single();

        if (error) throw error;

        await logEmployeeActivity('create', data.name, {
          employee_id: newEmployee.id,
          rank: data.rank,
          wage_rate: data.wage_rate,
          status: data.status,
          creation_time: new Date().toISOString()
        });

        toast.success(`Employee ${data.name} added successfully`);
      }

      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
    onClose?.();
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter employee name" 
                  className="bg-adicorp-dark border-white/20 text-white"
                  {...field} 
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
              <FormControl>
                <Input 
                  placeholder="Enter employee rank" 
                  className="bg-adicorp-dark border-white/20 text-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wage_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wage Rate</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Enter wage rate" 
                  className="bg-adicorp-dark border-white/20 text-white"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-adicorp-dark border-white/20 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          >
            {loading ? "Saving..." : currentEmployee ? "Update Employee" : "Add Employee"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-adicorp-dark border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentEmployee ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {currentEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {currentEmployee ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {currentEmployee ? "Edit Employee" : "Add New Employee"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
