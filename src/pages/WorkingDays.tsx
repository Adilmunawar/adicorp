
import Dashboard from "@/components/layout/Dashboard";
import CompanyWorkingSettings from "@/components/settings/CompanyWorkingSettings";
import MonthlyWorkingDaysManager from "@/components/settings/MonthlyWorkingDaysManager";
import WorkingDaysConfig from "@/components/settings/WorkingDaysConfig";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Clock } from "lucide-react";

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
    <Dashboard title="Working Days Configuration">
      <div className="space-y-6">
        {/* Company Working Settings */}
        <CompanyWorkingSettings />

        {/* Monthly Working Days Manager */}
        <MonthlyWorkingDaysManager />

        {/* Working Days Configuration (for specific day settings) */}
        <WorkingDaysConfig />
      </div>
    </Dashboard>
  );
}
