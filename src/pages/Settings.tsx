
import Dashboard from "@/components/layout/Dashboard";
import CompanySetupModal from "@/components/company/CompanySetupModal";
import BackupManager from "@/components/backup/BackupManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Building2, User, Shield, Calendar } from "lucide-react";

export default function SettingsPage() {
  const { userProfile, user } = useAuth();

  return (
    <Dashboard title="Settings">
      <div className="space-y-6">
        {/* Company Information Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile?.companies ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Company Name</label>
                    <p className="font-medium">{userProfile.companies.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Phone</label>
                    <p className="font-medium">{userProfile.companies.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Website</label>
                    <p className="font-medium">{userProfile.companies.website || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Address</label>
                    <p className="font-medium">{userProfile.companies.address || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <CompanySetupModal />
                  <Button 
                    onClick={() => window.location.href = '/working-days'}
                    variant="outline"
                    className="border-white/10 hover:bg-adicorp-dark"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Working Days
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Company Setup</h3>
                <p className="text-white/60 mb-4">
                  You haven't set up your company information yet. Complete the setup to access all features.
                </p>
                <CompanySetupModal />
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Role</label>
                <p className="font-medium">{userProfile?.is_admin ? 'Administrator' : 'User'}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">First Name</label>
                <p className="font-medium">{userProfile?.first_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Last Name</label>
                <p className="font-medium">{userProfile?.last_name || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Backup Section */}
        <BackupManager />

        {/* Security Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Password Security</h3>
              <p className="text-sm text-white/70">
                Manage your account password and security settings.
              </p>
              <Button variant="outline" className="border-white/10 hover:bg-adicorp-dark">
                Change Password
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Data Privacy</h3>
              <p className="text-sm text-white/70">
                Your data is securely stored and encrypted. We never share your information with third parties.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
