
import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Building, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export default function SettingsPage() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  
  const [company, setCompany] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
  });
  
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  useEffect(() => {
    const fetchProfileAndCompany = async () => {
      if (!session || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, company_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfile({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          email: user.email || "",
        });
        
        // If company_id exists, fetch company details
        if (profileData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name, address, phone, website')
            .eq('id', profileData.company_id)
            .single();
            
          if (companyError) throw companyError;
          
          setCompany({
            name: companyData.name || "",
            address: companyData.address || "",
            phone: companyData.phone || "",
            website: companyData.website || "",
          });
        }
        
      } catch (error) {
        console.error("Error fetching settings data:", error);
        toast({
          title: "Failed to load settings",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndCompany();
  }, [user, session, toast]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };
  
  const updateProfile = async () => {
    if (!session || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      sonnerToast.success("Profile updated", {
        description: "Your profile has been updated successfully."
      });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const updateCompany = async () => {
    if (!session || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update company settings.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      // First get company_id from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profileData.company_id) {
        throw new Error("Company not found. Please set up your company first.");
      }
      
      // Update company details
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          address: company.address,
          phone: company.phone,
          website: company.website,
        })
        .eq('id', profileData.company_id);
        
      if (error) throw error;
      
      sonnerToast.success("Company updated", {
        description: "Your company information has been updated successfully."
      });
      
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Failed to update company",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const updatePassword = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to change your password.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.new !== password.confirm) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password.new,
      });
      
      if (error) throw error;
      
      sonnerToast.success("Password updated", {
        description: "Your password has been changed successfully."
      });
      
      // Reset password fields
      setPassword({
        current: "",
        new: "",
        confirm: "",
      });
      
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Failed to update password",
        description: "Please ensure your current password is correct and try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <Dashboard title="Settings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-adicorp-purple" />
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard title="Settings">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-3 mb-4">
          <TabsTrigger value="profile" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Building className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center">
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    disabled
                    className="bg-adicorp-dark/80 border-white/10"
                  />
                  <Mail className="h-4 w-4 ml-2 text-white/40" />
                </div>
                <p className="text-xs text-white/60">Email address cannot be changed.</p>
              </div>
              
              <Button 
                onClick={updateProfile}
                disabled={updating}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={company.name}
                  onChange={handleCompanyChange}
                  className="bg-adicorp-dark/60 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={company.address}
                  onChange={handleCompanyChange}
                  className="bg-adicorp-dark/60 border-white/10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={company.phone}
                    onChange={handleCompanyChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={company.website}
                    onChange={handleCompanyChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={updateCompany}
                disabled={updating}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Company"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="current"
                  name="current"
                  type="password"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="bg-adicorp-dark/60 border-white/10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="new"
                    name="new"
                    type="password"
                    value={password.new}
                    onChange={handlePasswordChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={updatePassword}
                disabled={updating || !password.current || !password.new || !password.confirm}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
