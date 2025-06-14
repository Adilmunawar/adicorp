
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, X, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AttendanceBulkActionsProps {
  selectedDate: Date;
  employees: Array<{ id: string; name: string; }>;
  onAttendanceUpdate: () => void;
}

export default function AttendanceBulkActions({ 
  selectedDate, 
  employees, 
  onAttendanceUpdate 
}: AttendanceBulkActionsProps) {
  const [bulkAction, setBulkAction] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleBulkAction = async () => {
    if (!bulkAction || employees.length === 0) return;

    try {
      setProcessing(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // First, delete existing attendance records for this date
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .in('employee_id', employees.map(emp => emp.id))
        .eq('date', dateStr);

      if (deleteError) throw deleteError;

      // Insert new attendance records
      const attendanceRecords = employees.map(employee => ({
        employee_id: employee.id,
        date: dateStr,
        status: bulkAction,
      }));

      const { error: insertError } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      toast({
        title: "Bulk Action Completed",
        description: `Marked ${employees.length} employees as ${bulkAction} for ${format(selectedDate, 'MMM dd, yyyy')}`,
      });

      onAttendanceUpdate();
      setBulkAction("");
    } catch (error) {
      console.error("Error applying bulk action:", error);
      toast({
        title: "Error",
        description: "Failed to apply bulk attendance action.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'present': return 'Present';
      case 'short_leave': return 'Short Leave';
      case 'leave': return 'Leave';
      default: return 'Select Action';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'present': return 'bg-green-500/20 text-green-400';
      case 'short_leave': return 'bg-yellow-500/20 text-yellow-400';
      case 'leave': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-adicorp-purple" />
        <h3 className="font-semibold">Bulk Attendance Actions</h3>
      </div>

      <div className="flex items-center gap-2 text-sm text-white/70">
        <Calendar className="h-4 w-4" />
        <span>Date: {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
        <Badge variant="secondary" className="ml-2">
          {employees.length} Employees
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Select value={bulkAction} onValueChange={setBulkAction}>
          <SelectTrigger className="flex-1 bg-adicorp-dark border-white/10">
            <SelectValue placeholder="Select bulk action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Mark All as Present
              </div>
            </SelectItem>
            <SelectItem value="short_leave">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-400" />
                Mark All as Short Leave
              </div>
            </SelectItem>
            <SelectItem value="leave">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-400" />
                Mark All as Leave
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleBulkAction}
          disabled={!bulkAction || processing || employees.length === 0}
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
        >
          {processing ? 'Processing...' : 'Apply'}
        </Button>
      </div>

      {bulkAction && (
        <div className="p-3 rounded-lg border border-white/10 bg-adicorp-dark/30">
          <p className="text-sm">
            This will mark all <span className="font-medium">{employees.length} employees</span> as{' '}
            <Badge className={getActionColor(bulkAction)}>
              {getActionLabel(bulkAction)}
            </Badge>{' '}
            for {format(selectedDate, 'MMM dd, yyyy')}
          </p>
        </div>
      )}

      <div className="text-xs text-white/60 space-y-1">
        <p>• "Mark All as Present" is the quickest way to mark attendance</p>
        <p>• Individual attendance can be modified after bulk action</p>
        <p>• Only working days will show in attendance list</p>
      </div>
    </div>
  );
}
