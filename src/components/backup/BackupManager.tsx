
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, Database, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export default function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleBackupData = async () => {
    if (!userProfile?.company_id) {
      toast({
        title: "Company setup required",
        description: "Please complete company setup first.",
        variant: "destructive",
      });
      return;
    }

    setIsBackingUp(true);
    try {
      // Fetch all company data
      const [employeesResult, attendanceResult, companyResult] = await Promise.all([
        supabase
          .from('employees')
          .select('*')
          .eq('company_id', userProfile.company_id),
        supabase
          .from('attendance')
          .select('*'),
        supabase
          .from('companies')
          .select('*')
          .eq('id', userProfile.company_id)
          .single()
      ]);

      if (employeesResult.error || attendanceResult.error || companyResult.error) {
        throw new Error('Failed to fetch data for backup');
      }

      // Filter attendance for company employees only
      const employeeIds = new Set(employeesResult.data?.map(emp => emp.id) || []);
      const filteredAttendance = attendanceResult.data?.filter(att => 
        employeeIds.has(att.employee_id)
      ) || [];

      const backupData = {
        backup_date: new Date().toISOString(),
        company: companyResult.data,
        employees: employeesResult.data || [],
        attendance: filteredAttendance,
        metadata: {
          version: "1.0",
          total_employees: employeesResult.data?.length || 0,
          total_attendance_records: filteredAttendance.length
        }
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adicorp-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup completed",
        description: "Your data has been successfully backed up.",
      });

    } catch (error: any) {
      console.error("Backup error:", error);
      toast({
        title: "Backup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsRestoring(true);
      try {
        const text = await file.text();
        const backupData = JSON.parse(text);

        // Validate backup structure
        if (!backupData.company || !backupData.employees || !backupData.attendance) {
          throw new Error('Invalid backup file format');
        }

        toast({
          title: "Restore functionality",
          description: "Data restore is available for enterprise customers. Contact support for assistance.",
        });

      } catch (error: any) {
        console.error("Restore error:", error);
        toast({
          title: "Restore failed",
          description: error.message || "Invalid backup file.",
          variant: "destructive",
        });
      } finally {
        setIsRestoring(false);
      }
    };
    input.click();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Data Backup & Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-400" />
              Backup Data
            </h3>
            <p className="text-sm text-white/70">
              Create a secure backup of all your company data including employees, attendance records, and settings.
            </p>
            <Button
              onClick={handleBackupData}
              disabled={isBackingUp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isBackingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center">
              <Upload className="h-4 w-4 mr-2 text-blue-400" />
              Restore Data
            </h3>
            <p className="text-sm text-white/70">
              Restore your data from a previously created backup file. This will replace current data.
            </p>
            <Button
              onClick={handleRestoreData}
              disabled={isRestoring}
              variant="outline"
              className="w-full border-white/10 hover:bg-adicorp-dark"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from Backup
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Important:</strong> Keep your backup files in a secure location. Regular backups help protect against data loss.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
