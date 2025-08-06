
import Dashboard from "@/components/layout/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <Dashboard title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {userProfile?.companies?.logo && (
                <img 
                  src={userProfile.companies.logo} 
                  alt="Company Logo" 
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-adicorp-purple/30"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-adicorp-purple bg-clip-text text-transparent">
                  Welcome back{userProfile?.first_name ? `, ${userProfile.first_name}` : ''}!
                </h1>
                <p className="text-white/70 mt-1">
                  {userProfile?.companies?.name ? 
                    `Managing ${userProfile.companies.name}` : 
                    'Your HR management dashboard'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />
      </div>
    </Dashboard>
  );
}
