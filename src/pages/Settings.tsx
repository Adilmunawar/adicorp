
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  User,
  Building,
  LayoutGrid,
  Bell,
  LogOut,
  Save,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user, session, signOut, userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Form states
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  
  const [companyData, setCompanyData] = useState({
    name: "",
    address: "",
    phone: "",
    website: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    employeeUpdates: true,
    salaryNotifications: true,
    systemUpdates: false
  });

  useEffect(() => {
    // Update profile form when userProfile changes
    if (userProfile) {
      setProfileData({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: user?.email || ""
      });
      
      if (userProfile.companies) {
        setCompanyData({
          name: userProfile.companies.name || "",
          address: userProfile.companies.address || "",
          phone: userProfile.companies.phone || "",
          website: userProfile.companies.website || ""
        });
      }
    }
  }, [userProfile, user]);
  
  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true);
      await refreshProfile();
      sonnerToast.success("Profile data refreshed");
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      if (!session || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Updating user profile:", profileData);
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      // Refresh profile data
      await refreshProfile();
      
      sonnerToast.success("Profile updated", {
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompanyUpdate = async () => {
    try {
      setLoading(true);
      
      if (!session || !user || !userProfile) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      if (!userProfile.company_id) {
        toast({
          title: "Company not set up",
          description: "Please set up your company first.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Updating company data:", companyData);
      
      // Update company
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyData.name,
          address: companyData.address,
          phone: companyData.phone,
          website: companyData.website
        })
        .eq('id', userProfile.company_id);
        
      if (error) {
        console.error("Error updating company:", error);
        throw error;
      }
      
      // Refresh profile to get updated company data
      await refreshProfile();
      
      sonnerToast.success("Company updated", {
        description: "Your company information has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast({
        title: "Failed to update company",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationUpdate = () => {
    // In a real app, this would save to the database
    sonnerToast.success("Notification settings updated", {
      description: "Your notification preferences have been saved."
    });
  };
  
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogout = () => {
    signOut();
  };
  
  if (!userProfile && session) {
    return (
      <Dashboard title="Settings">
        <div className="flex flex-col justify-center items-center py-16 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-adicorp-purple" />
          <p className="text-white/70">Loading profile data...</p>
          <Button 
            variant="outline" 
            onClick={handleRefreshProfile}
            className="mt-4"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Profile
          </Button>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="System Settings">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshProfile}
          disabled={refreshing}
          className="text-adicorp-purple border-adicorp-purple/30"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-4 mb-4">
          <TabsTrigger value="profile" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Building className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-adicorp-purple" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      className="bg-adicorp-dark/60 border-white/10"
                      value={profileData.firstName}
                      onChange={handleProfileInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      className="bg-adicorp-dark/60 border-white/10"
                      value={profileData.lastName}
                      onChange={handleProfileInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-adicorp-dark/60 border-white/10"
                    value={profileData.email}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-white/60">Email address cannot be changed</p>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="destructive"
                    onClick={handleLogout}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                  
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-adicorp-purple" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your organization details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="name"
                    className="bg-adicorp-dark/60 border-white/10"
                    value={companyData.name}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    name="address"
                    className="bg-adicorp-dark/60 border-white/10"
                    value={companyData.address}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      name="phone"
                      className="bg-adicorp-dark/60 border-white/10"
                      value={companyData.phone}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      name="website"
                      className="bg-adicorp-dark/60 border-white/10"
                      value={companyData.website}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleCompanyUpdate}
                    disabled={loading}
                    className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Company Info
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-adicorp-purple" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-white/60">Receive important updates via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Employee Updates</h4>
                    <p className="text-sm text-white/60">Get notified when employee data changes</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.employeeUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, employeeUpdates: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Salary Reports</h4>
                    <p className="text-sm text-white/60">Receive monthly salary processing notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.salaryNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, salaryNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-white/60">Get notified about system changes and maintenance</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleNotificationUpdate}
                    className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutGrid className="h-5 w-5 mr-2 text-adicorp-purple" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-white/60">Already enabled in this theme</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Compact View</h4>
                    <p className="text-sm text-white/60">Display more content with less spacing</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Theme Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-600 border-2 border-white" />
                      <span className="text-xs mt-1">Default</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-600" />
                      <span className="text-xs mt-1">Blue</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-green-600" />
                      <span className="text-xs mt-1">Green</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-red-600" />
                      <span className="text-xs mt-1">Red</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
                    onClick={() => sonnerToast.success("Appearance settings saved")}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
