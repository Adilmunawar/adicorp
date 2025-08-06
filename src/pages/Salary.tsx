
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Download, RefreshCw } from "lucide-react";
import { useSalaryData } from "@/hooks/useSalaryData";
import { useSalaryDownloads } from "@/hooks/useSalaryDownloads";
import SalaryStats from "@/components/salary/SalaryStats";
import SalarySheet from "@/components/salary/SalarySheet";
import PayslipsGrid from "@/components/salary/PayslipsGrid";
import MonthSelector from "@/components/common/MonthSelector";
import { startOfMonth } from "date-fns";

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState("salary-sheet");
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  
  const {
    employeeSalaryData,
    loading,
    stats,
    error,
    totalWorkingDaysThisMonth,
    currentMonthName,
    handleRetry
  } = useSalaryData(selectedMonth);

  const {
    downloading,
    handleSalarySheetDownload,
    handlePayslipsDownload,
    handleIndividualPayslipDownload
  } = useSalaryDownloads(employeeSalaryData, totalWorkingDaysThisMonth, currentMonthName);

  if (error && !loading) {
    return (
      <Dashboard title="Salary Management">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={handleRetry} 
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="Salary Management">
      <div className="flex justify-between items-center mb-6">
        <MonthSelector 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <div className="text-sm text-white/60">
          Viewing data for {currentMonthName}
        </div>
      </div>

      <SalaryStats stats={stats} loading={loading} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-2 mb-4">
          <TabsTrigger 
            value="salary-sheet" 
            className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Salary Sheet
          </TabsTrigger>
          <TabsTrigger 
            value="payslips" 
            className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Payslips
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="salary-sheet">
          <SalarySheet
            employeeSalaryData={employeeSalaryData}
            totalWorkingDaysThisMonth={totalWorkingDaysThisMonth}
            currentMonthName={currentMonthName}
            loading={loading}
            downloading={downloading}
            onDownload={handleSalarySheetDownload}
          />
        </TabsContent>
        
        <TabsContent value="payslips">
          <PayslipsGrid
            employeeSalaryData={employeeSalaryData}
            totalWorkingDaysThisMonth={totalWorkingDaysThisMonth}
            currentMonthName={currentMonthName}
            loading={loading}
            downloading={downloading}
            onDownloadAll={handlePayslipsDownload}
            onDownloadIndividual={handleIndividualPayslipDownload}
          />
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
