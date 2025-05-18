
import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CompanyInsert } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";

interface CompanySetupProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function CompanySetupForm({ isOpen, onComplete }: CompanySetupProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Omit<CompanyInsert, 'id' | 'created_at'>>({
    name: "",
    phone: "",
    website: "",
    address: "",
    logo: null
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
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
        .insert(formData)
        .select()
        .single();
        
      if (companyError) throw companyError;
      
      // Update user profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: companyData.id,
          is_admin: true 
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Company setup complete",
        description: "Your company has been successfully configured.",
      });
      
      onComplete();
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
    <Dialog open={isOpen}>
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Your Company</DialogTitle>
          <DialogDescription>
            Enter your company details to get started with AdiCorp Management.
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
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website || ""}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              className="bg-adicorp-dark/60 border-white/10"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.name}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
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
