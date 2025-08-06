
import Dashboard from "@/components/layout/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building, Calendar, Clock, DollarSign, Lock, Database } from "lucide-react";
import CompanySetupModal from "@/components/company/CompanySetupModal";
import CurrencySettings from "@/components/settings/CurrencySettings";
import WorkingDaysConfig from "@/components/settings/WorkingDaysConfig";
import MonthlyWorkingDaysManager from "@/components/settings/MonthlyWorkingDaysManager";
import WorkingTimePolicies from "@/components/settings/WorkingTimePolicies";
import PasswordSettings from "@/components/settings/PasswordSettings";
import BackupManager from "@/components/backup/BackupManager";

export default function SettingsPage() {
  return (
    <Dashboard title="Settings">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="glass-card p-6 mb-6">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-adicorp-purple to-white bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-white/70 text-lg">
              Configure your company settings, preferences, and system parameters to customize your HR management experience
            </p>
          </div>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <div className="glass-card p-2">
            <TabsList className="bg-adicorp-dark-light/60 grid grid-cols-7 p-2 gap-1 h-auto">
              <TabsTrigger 
                value="company" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Building className="h-5 w-5" />
                <span className="text-xs font-medium">Company</span>
              </TabsTrigger>
              <TabsTrigger 
                value="currency" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-medium">Currency</span>
              </TabsTrigger>
              <TabsTrigger 
                value="working-days" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-medium">Working Days</span>
              </TabsTrigger>
              <TabsTrigger 
                value="monthly-config" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs font-medium">Monthly</span>
              </TabsTrigger>
              <TabsTrigger 
                value="policies" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs font-medium">Policies</span>
              </TabsTrigger>
              <TabsTrigger 
                value="password" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Lock className="h-5 w-5" />
                <span className="text-xs font-medium">Password</span>
              </TabsTrigger>
              <TabsTrigger 
                value="backup" 
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-adicorp-purple data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-200"
              >
                <Database className="h-5 w-5" />
                <span className="text-xs font-medium">Backup</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="company" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-adicorp-purple/20">
                    <Building className="h-6 w-6 text-adicorp-purple" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Company Information</h2>
                    <p className="text-white/70">Manage your company details and branding</p>
                  </div>
                </div>
                <CompanySetupModal />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Currency Settings</h2>
                    <p className="text-white/70">Configure your preferred currency for salary calculations</p>
                  </div>
                </div>
                <CurrencySettings />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="working-days" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Working Days Configuration</h2>
                    <p className="text-white/70">Set up your company's working days and weekend schedule</p>
                  </div>
                </div>
                <WorkingDaysConfig />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly-config" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Settings className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Monthly Working Days</h2>
                    <p className="text-white/70">Configure working days and salary divisors for specific months</p>
                  </div>
                </div>
                <MonthlyWorkingDaysManager />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Working Time Policies</h2>
                    <p className="text-white/70">Define working hours, overtime rules, and time-off policies</p>
                  </div>
                </div>
                <WorkingTimePolicies />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Lock className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Password & Security</h2>
                    <p className="text-white/70">Update your password and manage security settings</p>
                  </div>
                </div>
                <PasswordSettings />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <div className="glass-card p-1">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <Database className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Backup & Restore</h2>
                    <p className="text-white/70">Create backups and restore your data safely</p>
                  </div>
                </div>
                <BackupManager />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}
