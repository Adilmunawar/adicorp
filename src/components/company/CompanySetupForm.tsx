
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";

interface CompanySetupFormProps {
  isOpen?: boolean;
  onComplete?: () => void;
}

export default function CompanySetupForm({ onComplete }: CompanySetupFormProps) {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    website: "",
    address: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      console.log("CompanySetupForm - Creating company:", formData);
      
      // Create new company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          phone: formData.phone || null,
          website: formData.website || null,
          address: formData.address || null
        })
        .select('*')
        .single();
        
      if (companyError) {
        console.error("CompanySetupForm - Company creation error:", companyError);
        throw companyError;
      }
      
      console.log("CompanySetupForm - Company created:", companyData);
      
      // Update user profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: companyData.id,
          is_admin: true 
        })
        .eq('id', user.id);
        
      if (profileError) {
        console.error("CompanySetupForm - Profile update error:", profileError);
        throw profileError;
      }
      
      console.log("CompanySetupForm - Profile updated with company_id");
      
      // Refresh profile data
      await refreshProfile();
      
      sonnerToast.success("Company setup complete", {
        description: "Your company has been successfully configured."
      });
      
      if (onComplete) {
        onComplete();
      }
      
    } catch (error: any) {
      console.error("CompanySetupForm - Error setting up company:", error);
      toast({
        title: "Failed to setup company",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="mr-2 h-5 w-5 text-adicorp-purple" />
          Setup Your Company
        </CardTitle>
        <CardDescription>
          Enter your company details to get started with AdiCorp HR Management.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit"
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
        </CardFooter>
      </form>
    </Card>
  );
}
