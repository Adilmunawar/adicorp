
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Download, Upload, FileSpreadsheet, Users } from "lucide-react";
import * as XLSX from 'xlsx';
import { EmployeeRow } from "@/types/supabase";

interface EmployeeImportExportProps {
  onImportComplete: () => void;
  employees: EmployeeRow[];
}

interface ImportEmployee {
  name: string;
  rank: string;
  wage_rate: number;
  status?: string;
}

export default function EmployeeImportExport({ onImportComplete, employees }: EmployeeImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useAuth();

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "John Doe",
        rank: "Manager", 
        wage_rate: 50000,
        status: "active"
      },
      {
        name: "Jane Smith",
        rank: "Developer",
        wage_rate: 45000,
        status: "active"
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 20 }, // name
      { width: 15 }, // rank
      { width: 15 }, // wage_rate
      { width: 10 }  // status
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Employee Template");
    XLSX.writeFile(wb, "employee_import_template.xlsx");
    
    toast.success("Template downloaded", {
      description: "Use this template to import your employees"
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!userProfile?.company_id) {
      toast.error("Company setup required", {
        description: "Please set up your company first"
      });
      return;
    }

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportEmployee[];

      if (!jsonData.length) {
        throw new Error("No data found in the file");
      }

      // Validate required fields
      const requiredFields = ['name', 'rank', 'wage_rate'];
      const missingFields = requiredFields.filter(field => 
        !jsonData.every(row => row[field as keyof ImportEmployee] !== undefined)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Prepare data for insertion
      const employeesToInsert = jsonData.map(emp => ({
        name: emp.name.toString().trim(),
        rank: emp.rank.toString().trim(),
        wage_rate: parseFloat(emp.wage_rate.toString()),
        status: emp.status ? emp.status.toString().toLowerCase() : 'active',
        company_id: userProfile.company_id
      }));

      // Validate wage rates are numbers
      const invalidWages = employeesToInsert.filter(emp => isNaN(emp.wage_rate));
      if (invalidWages.length > 0) {
        throw new Error("Some wage rates are not valid numbers");
      }

      // Insert employees into database
      const { data: insertedData, error } = await supabase
        .from('employees')
        .insert(employeesToInsert)
        .select();

      if (error) {
        console.error("Error inserting employees:", error);
        throw error;
      }

      toast.success("Import successful", {
        description: `Successfully imported ${insertedData?.length || 0} employees`
      });

      onImportComplete();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Please check your file format"
      });
    } finally {
      setImporting(false);
    }
  };

  const exportEmployees = async () => {
    if (!employees.length) {
      toast.error("No employees to export", {
        description: "Add some employees first"
      });
      return;
    }

    setExporting(true);

    try {
      // Prepare data for export
      const exportData = employees.map(emp => ({
        name: emp.name,
        rank: emp.rank,
        wage_rate: emp.wage_rate,
        status: emp.status,
        created_at: new Date(emp.created_at).toLocaleDateString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { width: 20 }, // name
        { width: 15 }, // rank
        { width: 15 }, // wage_rate
        { width: 10 }, // status
        { width: 15 }  // created_at
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
      const fileName = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("Export successful", {
        description: `Exported ${employees.length} employees to ${fileName}`
      });

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: "Please try again"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import/Export Employees
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import from Excel
          </h3>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-fit"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Employee Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="cursor-pointer"
              />
            </div>
            
            {importing && (
              <div className="text-sm text-white/70">
                Importing employees... Please wait.
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </h3>
          <Button
            onClick={exportEmployees}
            disabled={exporting || employees.length === 0}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          >
            <Users className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : `Export ${employees.length} Employees`}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-adicorp-dark/30 rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold text-sm mb-2">Import Instructions:</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Download the template first to see the required format</li>
            <li>• Required columns: name, rank, wage_rate</li>
            <li>• Optional column: status (active/inactive, defaults to active)</li>
            <li>• Wage rate must be a valid number</li>
            <li>• Supported formats: .xlsx, .xls, .csv</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
