
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { toast } from "sonner";
import { UserPlus, Save } from "lucide-react";
import type { EmployeeRow } from "@/types/supabase";

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
}

export default function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { logEmployeeActivity } = useActivityLogger();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || "",
      rank: employee?.rank || "",
      wage_rate: employee?.wage_rate || 0,
      status: employee?.status === "inactive" ? "inactive" : "active",
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    if (!userProfile?.company_id) {
      toast.error("Company setup required");
      return;
    }

    setLoading(true);
    try {
      if (employee) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({
            name: data.name,
            rank: data.rank,
            wage_rate: data.wage_rate,
            status: data.status,
          })
          .eq("id", employee.id);

        if (error) throw error;

        await logEmployeeActivity('update', data.name, {
          employee_id: employee.id,
          previous_name: employee.name,
          previous_rank: employee.rank,
          previous_wage_rate: employee.wage_rate,
          new_rank: data.rank,
          new_wage_rate: data.wage_rate,
          status_change: employee.status !== data.status ? `${employee.status} → ${data.status}` : 'No change'
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
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {employee ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {employee ? "Edit Employee" : "Add New Employee"}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                {loading ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
