
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CompanySetupModal() {
  const { toast } = useToast();
  const { user, userProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    website: "",
    address: ""
  });

  // Check if user needs company setup
  useEffect(() => {
    if (user && userProfile === null) {
      setIsOpen(true);
    } else if (user && userProfile && !userProfile.company_id) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, userProfile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      // Create new company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          phone: formData.phone || null,
          website: formData.website || null,
          address: formData.address || null
        })
        .select()
        .single();
        
      if (companyError) throw companyError;
      
      console.log("Company created:", companyData);
      
      // Update user profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: companyData.id,
          is_admin: true 
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      console.log("Profile updated with company_id");
      
      // Refresh profile data
      await refreshProfile();
      
      sonnerToast.success("Company setup complete", {
        description: "Your company has been successfully configured."
      });
      
      setIsOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error setting up company:", error);
      toast({
        title: "Failed to setup company",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if we have a company set up
      if (userProfile && userProfile.company_id) {
        setIsOpen(open);
      }
    }}>
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-adicorp-purple" />
            Setup Your Company
          </DialogTitle>
          <DialogDescription>
            Enter your company details to get started with AdiCorp HR Management.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
              placeholder="e.g. +1 (555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
              placeholder="e.g. www.example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
              placeholder="e.g. 123 Main Street, City, Country"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
