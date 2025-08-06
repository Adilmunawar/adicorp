
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, Database, Shield, Loader2, AlertCircle, CheckCircle, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

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
      // Fetch all company data with more details
      const [employeesResult, attendanceResult, companyResult, eventsResult, settingsResult] = await Promise.all([
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
          .single(),
        supabase
          .from('events')
          .select('*')
          .eq('company_id', userProfile.company_id),
        supabase
          .from('company_working_settings')
          .select('*')
          .eq('company_id', userProfile.company_id)
          .maybeSingle()
      ]);

      if (employeesResult.error || attendanceResult.error || companyResult.error) {
        throw new Error('Failed to fetch data for backup');
      }

      // Filter attendance for company employees only
      const employeeIds = new Set(employeesResult.data?.map(emp => emp.id) || []);
      const filteredAttendance = attendanceResult.data?.filter(att => 
        employeeIds.has(att.employee_id)
      ) || [];

      const backupTimestamp = new Date().toISOString();
      const backupData = {
        backup_date: backupTimestamp,
        backup_version: "2.0",
        company: companyResult.data,
        employees: employeesResult.data || [],
        attendance: filteredAttendance,
        events: eventsResult.data || [],
        company_settings: settingsResult.data,
        metadata: {
          version: "2.0",
          total_employees: employeesResult.data?.length || 0,
          total_attendance_records: filteredAttendance.length,
          total_events: eventsResult.data?.length || 0,
          backup_size: "calculating...",
          company_name: companyResult.data?.name || "Unknown"
        }
      };

      // Create and download backup file
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], {
        type: 'application/json'
      });
      
      // Update metadata with actual size
      backupData.metadata.backup_size = `${(blob.size / 1024).toFixed(2)} KB`;
      
      const url = URL.createObjectURL(blob);
      const fileName = `adicorp-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log the backup activity
      await logActivity({
        actionType: 'system_backup',
        description: `System backup created: ${fileName}`,
        details: {
          file_name: fileName,
          backup_size: backupData.metadata.backup_size,
          employees_count: backupData.metadata.total_employees,
          attendance_records: backupData.metadata.total_attendance_records,
          events_count: backupData.metadata.total_events,
          backup_version: "2.0",
          company_name: backupData.metadata.company_name
        },
        priority: 'high'
      });

      setLastBackup(backupTimestamp);

      toast({
        title: "Backup completed successfully",
        description: `Your data has been backed up to ${fileName}`,
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

        // Log the restore attempt
        await logActivity({
          actionType: 'system_restore',
          description: `System restore attempted from file: ${file.name}`,
          details: {
            file_name: file.name,
            file_size: `${(file.size / 1024).toFixed(2)} KB`,
            backup_version: backupData.backup_version || "1.0",
            backup_date: backupData.backup_date || "Unknown",
            restore_status: "attempted"
          },
          priority: 'high'
        });

        toast({
          title: "Restore functionality",
          description: "Data restore is available for enterprise customers. Contact support for assistance.",
        });

      } catch (error: any) {
        console.error("Restore error:", error);
        
        // Log the failed restore
        await logActivity({
          actionType: 'system_restore',
          description: `System restore failed: ${error.message}`,
          details: {
            file_name: file.name,
            error_message: error.message,
            restore_status: "failed"
          },
          priority: 'high'
        });

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
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Advanced Data Backup & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Alert */}
          {lastBackup && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Last backup created: {format(new Date(lastBackup), 'MMM dd, yyyy HH:mm:ss')}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  Create Backup
                </h3>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Enhanced v2.0
                </Badge>
              </div>
              <p className="text-sm text-white/70">
                Create a comprehensive backup including employees, attendance, events, and company settings with enhanced metadata.
              </p>
              <div className="bg-adicorp-dark/30 rounded-lg p-3 border border-white/10">
                <h4 className="font-medium text-sm mb-2">Backup includes:</h4>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• Company information & settings</li>
                  <li>• Employee records & status</li>
                  <li>• Attendance data & history</li>
                  <li>• Events & holidays</li>
                  <li>• Working days configuration</li>
                  <li>• Backup metadata & versioning</li>
                </ul>
              </div>
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
                    Create Enhanced Backup
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <History className="h-4 w-4 mr-2 text-blue-400" />
                  Restore Data
                </h3>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Enterprise
                </Badge>
              </div>
              <p className="text-sm text-white/70">
                Restore your system from a previously created backup file. This feature includes validation and logging.
              </p>
              <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                <p className="text-xs text-yellow-400">
                  <strong>Note:</strong> Full restore functionality requires enterprise support. Contact our team for assistance.
                </p>
              </div>
              <Button
                onClick={handleRestoreData}
                disabled={isRestoring}
                variant="outline"
                className="w-full border-white/10 hover:bg-adicorp-dark"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
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

          <Alert className="border-blue-500/20 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Security Notice:</strong> All backup and restore operations are logged with timestamps and user details for audit purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
