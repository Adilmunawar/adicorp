
import Dashboard from "@/components/layout/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building, Calendar, Clock, DollarSign, Lock } from "lucide-react";
import CompanySetupModal from "@/components/company/CompanySetupModal";
import CurrencySettings from "@/components/settings/CurrencySettings";
import WorkingDaysConfig from "@/components/settings/WorkingDaysConfig";
import MonthlyWorkingDaysManager from "@/components/settings/MonthlyWorkingDaysManager";
import WorkingTimePolicies from "@/components/settings/WorkingTimePolicies";
import PasswordSettings from "@/components/settings/PasswordSettings";

export default function SettingsPage() {
  return (
    <Dashboard title="Settings">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-white/70">Configure your company settings and preferences</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-6 p-1">
            <TabsTrigger 
              value="company" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger 
              value="currency" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Currency</span>
            </TabsTrigger>
            <TabsTrigger 
              value="working-days" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Working Days</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monthly-config" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Monthly</span>
            </TabsTrigger>
            <TabsTrigger 
              value="policies" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="flex items-center gap-2 data-[state=active]:bg-adicorp-purple"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <CompanySetupModal />
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <CurrencySettings />
          </TabsContent>

          <TabsContent value="working-days" className="space-y-6">
            <WorkingDaysConfig />
          </TabsContent>

          <TabsContent value="monthly-config" className="space-y-6">
            <MonthlyWorkingDaysManager />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <WorkingTimePolicies />
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <PasswordSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}
