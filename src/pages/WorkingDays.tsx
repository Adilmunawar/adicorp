
import Dashboard from "@/components/layout/Dashboard";
import CompanyWorkingSettings from "@/components/settings/CompanyWorkingSettings";
import MonthlyWorkingDaysManager from "@/components/settings/MonthlyWorkingDaysManager";
import WorkingDaysConfig from "@/components/settings/WorkingDaysConfig";
import ShiftManagement from "@/components/settings/ShiftManagement";
import WorkingTimePolicies from "@/components/settings/WorkingTimePolicies";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, Clock, Shield } from "lucide-react";

export default function WorkingDaysPage() {
  const { userProfile } = useAuth();

  if (!userProfile?.companies) {
    return (
      <Dashboard title="Working Days Configuration">
        <div className="text-center py-8">
          <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Company Setup Required</h3>
          <p className="text-white/60 mb-4">
            You need to complete company setup before configuring working days.
          </p>
          <Button 
            onClick={() => window.location.href = '/settings'}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            Go to Settings
          </Button>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard title="Advanced Working Days & Time Management">
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-4 mb-4">
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Basic Setup
            </TabsTrigger>
            <TabsTrigger 
              value="shifts" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Shift Management
            </TabsTrigger>
            <TabsTrigger 
              value="policies" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Time Policies
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Monthly Config
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            {/* Company Working Settings */}
            <CompanyWorkingSettings />
            
            {/* Working Days Configuration */}
            <WorkingDaysConfig />
          </TabsContent>
          
          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>
          
          <TabsContent value="policies">
            <WorkingTimePolicies />
          </TabsContent>
          
          <TabsContent value="monthly">
            <MonthlyWorkingDaysManager />
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}
